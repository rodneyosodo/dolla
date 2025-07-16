package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rodneyosodo/dolla/backend/internal/dolla"
	"github.com/rodneyosodo/dolla/backend/internal/dolla/api"
	"github.com/rodneyosodo/dolla/backend/internal/dolla/repository"
	sloggin "github.com/samber/slog-gin"
	"golang.org/x/sync/errgroup"
)

const (
	svcName            = "backend-service"
	shutdownTimeout    = 30 * time.Second
	shutdownDeadline   = 5 * time.Second
	maxMultipartMemory = 100 << 20 // 100 MiB
)

type config struct {
	LogLevel        string `env:"DOLLA_BACKEND_LOG_LEVEL"         envDefault:"info"`
	HTTPAddress     string `env:"DOLLA_BACKEND_HTTP_ADDRESS"      envDefault:":9010"`
	DBFile          string `env:"DOLLA_BACKEND_DB_FILE"           envDefault:"db.sqlite3"`
	GinMode         string `env:"DOLLA_BACKEND_GIN_MODE"          envDefault:"release"`
	PDFExtractorURL string `env:"DOLLA_BACKEND_PDF_EXTRACTOR_URL" envDefault:"http://localhost:9000/extract"`
	OpenAIKey       string `env:"DOLLA_BACKEND_OPENAI_KEY"        envDefault:""`
	OpenAIModel     string `env:"DOLLA_BACKEND_OPENAI_MODEL"      envDefault:"gpt-4o-mini"`
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	g, ctx := errgroup.WithContext(ctx)

	cfg := config{}
	if err := env.Parse(&cfg); err != nil {
		log.Printf("failed to load %s configuration : %s", svcName, err.Error())

		return
	}

	var level slog.Level
	if err := level.UnmarshalText([]byte(cfg.LogLevel)); err != nil {
		log.Printf("failed to parse log level: %s", err.Error())

		return
	}
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
	slog.SetDefault(logger)

	slog.Info("Starting " + svcName)

	repo, err := repository.NewRepository(cfg.DBFile)
	if err != nil {
		slog.Error("failed to create repository", slog.String("err", err.Error()))

		return
	}

	slog.Info("successfully connected to sqlite3 database")

	var receiptProcessor *dolla.ReceiptProcessor
	if cfg.OpenAIKey != "" {
		receiptProcessor = dolla.NewReceiptProcessor(cfg.OpenAIKey, cfg.OpenAIModel)
	}

	svc := dolla.NewService(repo, cfg.PDFExtractorURL, receiptProcessor)

	gin.SetMode(cfg.GinMode)

	router := gin.New()
	router.Use(cors.Default())
	router.Use(gin.Recovery())
	router.Use(sloggin.New(logger))
	router.MaxMultipartMemory = maxMultipartMemory

	router = api.NewHandler(svc, router)

	srv := &http.Server{
		Addr:    cfg.HTTPAddress,
		Handler: router.Handler(),
	}

	g.Go(func() error {
		slog.Info("starting http server", slog.String("address", cfg.HTTPAddress))

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			return err
		}

		return nil
	})

	g.Go(func() error {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case sig := <-sigChan:
			slog.Info("received shutdown signal", slog.String("signal", sig.String()))

			shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), shutdownTimeout)
			defer shutdownCancel()

			slog.Info("initiating graceful shutdown")

			if err := srv.Shutdown(shutdownCtx); err != nil { //nolint:contextcheck
				slog.Warn("graceful shutdown failed, forcing shutdown", slog.String("error", err.Error()))

				_, forceCancel := context.WithTimeout(context.Background(), shutdownDeadline)
				defer forceCancel()

				return srv.Close()
			}

			slog.Info("graceful shutdown completed")

			return nil
		}
	})

	if err := g.Wait(); err != nil {
		slog.Error("service terminated with error", slog.String("error", err.Error()))

		return
	}

	slog.Info("service shutdown complete")
}
