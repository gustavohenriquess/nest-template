.PHONY: setup install sys-up sys-down prisma-gen test build start clean help rebuild auth-token

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  setup       Install dependencies, start DB, and generate Prisma client"
	@echo "  install     Install npm dependencies"
	@echo "  sys-up      Start docker-compose services"
	@echo "  sys-down    Stop docker-compose services"
	@echo "  rebuild     Force rebuild and restart services"
	@echo "  prisma-gen  Generate Prisma client"
	@echo "  test        Run tests with coverage"
	@echo "  build       Build the application"
	@echo "  start       Start application in development mode"
	@echo "  clean       Remove dist and coverage folders"
	@echo "  release     Create a new version tag and update CHANGELOG.md"
	@echo "  auth-token  Generate a JWT token for local development"

setup: install sys-up prisma-gen

install:
	npm install

sys-up:
	docker compose up -d

sys-down:
	docker compose down

rebuild: sys-down
	docker compose up -d --build

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

release:
	npm run release
	git push --follow-tags origin $$(git rev-parse --abbrev-ref HEAD)

auth-token:
	npx ts-node scripts/generate-token.ts
