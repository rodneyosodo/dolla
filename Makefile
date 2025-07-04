DOCKER_IMAGE_NAME_PREFIX ?= ghcr.io/rodneyosodo/dolla
BUILD_DIR = build
CGO_ENABLED ?= 0
GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)
VERSION ?= $(shell git describe --abbrev=0 --tags 2>/dev/null || echo "v0.0.0")
COMMIT ?= $(shell git rev-parse HEAD)
TIME ?= $(shell date +'%Y-%m-%dT%H:%M:%S%z')
COMMIT_TIME ?= $(shell git log -1 --date=format:"%Y-%m-%dT%H:%M:%S%z" --format=%cd)

define compile_go_service
	CGO_ENABLED=$(CGO_ENABLED) GOOS=$(GOOS) GOARCH=$(GOARCH) \
	go build -ldflags "-s -w" -o ${BUILD_DIR}/backend apps/backend/cmd/main.go
endef

define make_docker_backend
	docker build \
		--no-cache \
		--build-arg GOOS=$(GOOS) \
		--build-arg GOARCH=$(GOARCH) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/backend:$(VERSION) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/backend:latest \
		-f apps/backend/Dockerfile .
endef

define make_docker_ui
	docker build \
		--no-cache \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/$(1):$(VERSION) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/$(1):latest \
		-f apps/$(1)/Dockerfile .
endef

define make_docker_dev_backend
	docker build \
		--no-cache \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/backend:$(VERSION) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/backend:latest \
		-f apps/backend/Dockerfile.dev .
endef

define make_docker_pdf_extractor
	docker build \
		--no-cache \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/pdf-extractor:$(VERSION) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/pdf-extractor:latest \
		-f apps/pdf-extractor/Dockerfile apps/pdf-extractor/
endef

all: docker_backend docker_ui_dashboard docker_ui_web docker_pdf_extractor

clean:
	rm -rf ${BUILD_DIR}

backend:
	$(call compile_go_service)

docker_backend:
	$(call make_docker_backend)

docker_dev_backend:
	$(call make_docker_dev_backend)

docker_ui_dashboard:
	$(call make_docker_ui,dashboard)

docker_ui_web:
	$(call make_docker_ui,web)

docker_pdf_extractor:
	$(call make_docker_pdf_extractor)

define docker_push
	docker push $(DOCKER_IMAGE_NAME_PREFIX)/backend:$(1)
	docker push $(DOCKER_IMAGE_NAME_PREFIX)/web:$(1)
	docker push $(DOCKER_IMAGE_NAME_PREFIX)/dashboard:$(1)
	docker push $(DOCKER_IMAGE_NAME_PREFIX)/pdf-extractor:$(1)
endef

latest: all
	$(call docker_push,latest)

release: all
	$(call docker_push,$(VERSION))
	$(call docker_push,latest)

lint:
	golangci-lint run --config apps/backend/.golangci.yaml apps/backend/...

help:
	@echo "";
	@echo "██████╗  ██████╗ ██╗     ██╗      █████╗ ";
	@echo "██╔══██╗██╔═══██╗██║     ██║     ██╔══██╗";
	@echo "██║  ██║██║   ██║██║     ██║     ███████║";
	@echo "██║  ██║██║   ██║██║     ██║     ██╔══██║";
	@echo "██████╔╝╚██████╔╝███████╗███████╗██║  ██║";
	@echo "╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝";
	@echo "                                         ";
	@echo "Makefile commands:"
	@echo "";
	@echo "  help                 - Display this help message";
	@echo "  all                  - Build all services docker images";
	@echo "  clean                - Clean up build artifacts";
	@echo "  backend              - Build backend service binary";
	@echo "  docker_backend       - Build backend service docker image";
	@echo "  docker_dev_backend   - Build backend service docker image for development";
	@echo "  docker_ui_dashboard  - Build dashboard service docker image";
	@echo "  docker_ui_web        - Build web service docker image";
	@echo "  docker_pdf_extractor - Build pdf extractor service docker image";
	@echo "  latest               - Build and push latest docker images";
	@echo "  release              - Build and push release docker images";
	@echo "  lint                 - Run golangci-lint";
	@echo "";
	@echo "For javaScript/TypeScript projects, have a look at the package.json file for available scripts.";
