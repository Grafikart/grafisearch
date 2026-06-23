# Build stage
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install curl and bash
RUN apk add --no-cache curl bash

# Copy package files
COPY package.json bun.lockb ./

# Install bun using official installer
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Install dependencies
RUN bun install

# Copy source files for frontend build
COPY assets ./assets
COPY public ./public
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./

# Build frontend
RUN bun run build

# Go build stage
FROM golang:1.24-alpine AS go-builder

# Install dependencies for Chrome
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install templ
RUN go install github.com/a-h/templ/cmd/templ@latest

WORKDIR /app

# Copy Go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source files
COPY . .

# Copy built frontend assets from previous stage
COPY --from=frontend-builder /app/public ./public

# Generate templates
RUN templ generate

# Build Go binary
RUN CGO_ENABLED=0 GOOS=linux go build -o local-research .

# Final stage
FROM alpine:latest

# Install ca-certificates and Chrome dependencies for HTTPS requests
RUN apk --no-cache add \
    ca-certificates \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ttf-freefont \
    dbus

# Set Chrome path for chromedp
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /root/

# Copy binary from builder stage
COPY --from=go-builder /app/local-research .

# Expose port
EXPOSE 8042

# Run the binary
CMD ["./local-research"]