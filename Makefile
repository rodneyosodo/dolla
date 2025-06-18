DOCKER_IMAGE_NAME_PREFIX ?= ghcr.io/rodneyosodo/dolla
BUILD_DIR = build
SERVICE = backend
DOCKER = $(addprefix docker_,$(SERVICE))
DOCKER_DEV = $(addprefix docker_dev_,$(SERVICE))
CGO_ENABLED ?= 0
GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)
VERSION ?= $(shell git describe --abbrev=0 --tags 2>/dev/null || echo "v0.0.0")
COMMIT ?= $(shell git rev-parse HEAD)
TIME ?= $(shell date +'%Y-%m-%dT%H:%M:%S%z')
COMMIT_TIME ?= $(shell git log -1 --date=format:"%Y-%m-%dT%H:%M:%S%z" --format=%cd)

define compile_go_service
	CGO_ENABLED=$(CGO_ENABLED) GOOS=$(GOOS) GOARCH=$(GOARCH) \
	go build -ldflags "-s -w" -o ${BUILD_DIR}/$(SERVICE) apps/$(SERVICE)/cmd/main.go
endef

define make_docker
	docker buildx build \
		--no-cache \
		--build-arg GOOS=$(GOOS) \
		--build-arg GOARCH=$(GOARCH) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/$(SERVICE):$(VERSION) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/$(SERVICE):latest \
		-f apps/backend/Dockerfile .
endef

define make_docker_dev
	docker build \
		--no-cache \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/$(SERVICE):$(VERSION) \
		--tag=$(DOCKER_IMAGE_NAME_PREFIX)/$(SERVICE):latest \
		-f apps/backend/Dockerfile.dev .
endef

all: $(SERVICE)

.PHONY: all $(SERVICE) docker docker_dev latest release

clean:
	rm -rf ${BUILD_DIR}

$(SERVICE):
	$(call compile_go_service)

$(DOCKER):
	$(call make_docker)

$(DOCKER_DEV):
	$(call make_docker_dev)

docker: $(DOCKER)
docker_dev: $(DOCKER_DEV)

define docker_push
	docker push $(DOCKER_IMAGE_NAME_PREFIX)/$(SERVICE):$(1)
endef

latest: docker
	$(call docker_push,latest)

lint:
	golangci-lint run --config .golangci.yaml apps/backend/...
