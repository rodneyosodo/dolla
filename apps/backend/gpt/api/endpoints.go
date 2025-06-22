package api

import (
	"context"

	"github.com/go-kit/kit/endpoint"
	"github.com/rodneyosodo/dolla/backend/gpt"
	"github.com/rodneyosodo/dolla/backend/gpt/auth"
)

func chatEndpoint(svc gpt.Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(chatReq)

		res, err := svc.ChatWithFile(ctx, req.token, req.document)

		switch err {
		case auth.ErrFreeUsageExceeded:
			return err.Error(), nil
		case nil:
			return res, nil
		default:
			return nil, err
		}
	}
}
