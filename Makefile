.PHONY: godev
build:
	pnpm run build
	go build

.PHONY: godev
dev:
	gow run . --port=8000

.PHONY: frontdev
frontdev:
	pnpm run dev

.PHONY: install
install: grafisearch
	./grafisearch install

grafisearch:
	pnpm run build
	go build
