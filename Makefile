.PHONY: godev
build:
	pnpm run build
	go build

.PHONY: godev
dev:
	gow run .

.PHONY: godev
frontdev:
	pnpm run dev
