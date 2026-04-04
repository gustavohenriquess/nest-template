.PHONY: setup install sys-up sys-down prisma-gen test build start clean help

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  setup       Install dependencies, start DB, and generate Prisma client"
	@echo "  install     Install npm dependencies"
	@echo "  sys-up      Start docker-compose services"
	@echo "  sys-down    Stop docker-compose services"
	@echo "  prisma-gen  Generate Prisma client"
	@echo "  test        Run tests with coverage"
	@echo "  build       Build the application"
	@echo "  start       Start application in development mode"
	@echo "  clean       Remove dist and coverage folders"

setup: install sys-up prisma-gen

install:
	npm install

sys-up:
	docker-compose up -d

sys-down:
	docker-compose down

prisma-gen:
	npx prisma generate

test:
	npm run test:cov -- --no-cache

build:
	npm run build

start:
	npm run start:dev

clean:
	rm -rf dist coverage
