FROM golang:1.23-alpine AS builder
# Copy files
WORKDIR /app
COPY ./ ./
# Node.js
RUN apk add --update nodejs npm
RUN npm install
RUN npm run build
# templ
RUN go install github.com/a-h/templ/cmd/templ@latest
RUN templ generate
# Go
RUN go mod download
RUN go build -o /grafisearch
# Build image
FROM alpine:latest
COPY --from=builder /grafisearch /
EXPOSE 8042
CMD [ "/grafisearch" ]