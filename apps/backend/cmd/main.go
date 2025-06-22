package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/caarlos0/env/v10"
	"github.com/rodneyosodo/dolla/backend/gpt"
	"github.com/rodneyosodo/dolla/backend/gpt/api"
	"github.com/rodneyosodo/dolla/backend/gpt/auth"
)

type Config struct {
	Token      string `env:"OPEN_AI_TOKEN"`
	TwilioUser string `env:"TWILIO_USER"`
	TwilioPass string `env:"TWILIO_PASS"`
}

func main() {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		log.Fatalf("failed to load configuration : %s", err)
	}
	svc, err := gpt.NewGPT(cfg.Token)
	if err != nil {
		slog.Error(err.Error())
		return
	}
	authSvc := auth.New(svc)
	handler := api.MakeHandler(authSvc, cfg.TwilioUser, cfg.TwilioPass)

	if err := http.ListenAndServe(":8080", handler); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
