.PHONY: build
build:
	pnpm run build
	go build

.PHONY: dev
dev:
	go run .

.PHONY: frontdev
frontdev:
	pnpm run dev
