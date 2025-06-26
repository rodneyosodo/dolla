package auth

import (
	"context"
	"errors"
	"time"

	"github.com/rodneyosodo/dolla/backend/gpt"
)

var ErrFreeUsageExceeded = errors.New("exceeded free usage")

type authService struct {
	forFree map[string]time.Time
	svc     gpt.Service
}

func New(svc gpt.Service) gpt.Service {
	return &authService{
		forFree: make(map[string]time.Time),
		svc:     svc,
	}
}

func (s *authService) ChatWithFile(ctx context.Context, token, filePath string) (string, error) {
	lastVisit, found := s.forFree[token]
	now := time.Now()
	if found && lastVisit.Month() == now.Month() && lastVisit.Year() == now.Year() {
		return "", ErrFreeUsageExceeded
	}
	s.forFree[token] = now
	return s.svc.ChatWithFile(ctx, token, filePath)
}
