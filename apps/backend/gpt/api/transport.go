package api

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/go-zoo/bone"
	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rodneyosodo/dolla/backend/gpt"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

// MakeHandler returns a HTTP handler for API endpoints.
func MakeHandler(svc gpt.Service, twilioUser, twilioPass string) http.Handler {
	opts := []kithttp.ServerOption{
		kithttp.ServerErrorEncoder(encodeError),
	}

	r := bone.New()
	r.Post("/whatsapp", otelhttp.NewHandler(kithttp.NewServer(
		chatEndpoint(svc),
		decodeRequest(twilioUser, twilioPass),
		encodeTwilioResponse,
		opts...,
	), "chat"))

	r.Handle("/metrics", promhttp.Handler())

	return r
}

func decodeRequest(twilioUser, twilioPass string) kithttp.DecodeRequestFunc {
	return func(_ context.Context, r *http.Request) (interface{}, error) {
		numMediaStr := r.FormValue("NumMedia")
		numMedia, err := strconv.Atoi(numMediaStr)
		if err != nil {
			return nil, fmt.Errorf("invalid or missing parameter: NumMedia")
		}
		mediaURL := r.FormValue("MediaUrl0")

		if numMedia == 0 {
			return nil, errors.New("Send us a pdf of your statement!")
		}

		htReq, err := http.NewRequest(http.MethodGet, mediaURL, nil)
		if err != nil {
			return nil, err
		}
		htReq.SetBasicAuth(twilioUser, twilioPass)

		fileRes, err := http.DefaultClient.Do(htReq)
		if err != nil {
			return nil, err
		}
		defer fileRes.Body.Close()

		if fileRes.StatusCode != http.StatusOK {
			return nil, errors.New("Failed to retrieve file")
		}

		localFilePath := fmt.Sprintf("%s.pdf", uuid.New())
		localFile, err := os.Create(localFilePath)
		if err != nil {
			return nil, errors.New("Failed to create local file")
		}
		defer localFile.Close()

		_, err = io.Copy(localFile, fileRes.Body)
		if err != nil {
			return nil, errors.New("Failed to write local file")
		}

		return chatReq{document: localFilePath, token: r.FormValue("From")}, nil
	}
}

func encodeTwilioResponse(_ context.Context, w http.ResponseWriter, response interface{}) error {
	stringRes := response.(string)
	if len(stringRes) > 1600 {
		stringRes = stringRes[:1599]
	}

	_, err := w.Write([]byte(stringRes))
	return err
}

func encodeError(_ context.Context, err error, w http.ResponseWriter) {
	w.WriteHeader(http.StatusInternalServerError)
}
