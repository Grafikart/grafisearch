.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY:dev
dev: ## Start the development server
	parallel -j 3 --line-buffer ::: "APP_ENV=dev gow -r=false run ." "bun run dev" "templ generate --watch"

.PHONY: install
install: grafisearch ## Install the executable and register the service
	./grafisearch install

grafisearch:
	bun run build
	templ generate
	go build
	rm -rf public/assets
