.PHONY: godev
build:
	pnpm run build
	go build

.PHONY: godev
dev:
	make -j 2 godev frontdev

.PHONY: godev
godev:
	gow run .

.PHONY: godev
frontdev:
	pnpm run dev