# syntax=docker/dockerfile:1

###############################################################################
# Create a stage for building the application.
ARG GO_VERSION=1.18
FROM --platform=$BUILDPLATFORM golang:${GO_VERSION} AS build
WORKDIR /src
COPY . /src

# Install Node.js and pnpm.
RUN apt-get update && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /go/pkg/mod/ to speed up subsequent builds.
# Leverage bind mounts to go.sum and go.mod to avoid having to copy them into
# the container.
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=bind,source=go.sum,target=go.sum \
    --mount=type=bind,source=go.mod,target=go.mod \
    go mod download -x

# This is the architecture you're building for, which is passed in by the builder.
# Placing it here allows the previous steps to be cached across architectures.
ARG TARGETARCH

# Install JS dependencies with pnpm and run pnpm build.
# Leverage a cache mount for pnpm store to speed up subsequent builds.
# Leverage a bind mount to the current directory to avoid copying source code.
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=cache,target=/root/.pnpm-store \
    pnpm install && \
    pnpm run build

# Build the Go application.
RUN CGO_ENABLED=0 GOARCH=$TARGETARCH go build -o /bin/server .

################################################################################
# Create a new stage for running the application that contains the minimal
# runtime dependencies for the application. This often uses a different base
# image from the build stage where the necessary files are copied from the build
# stage.
FROM alpine:latest AS final

# Install any runtime dependencies that are needed to run your application.
# Leverage a cache mount to /var/cache/apk/ to speed up subsequent builds.
RUN --mount=type=cache,target=/var/cache/apk \
    apk --update add \
        ca-certificates \
        tzdata \
        && \
        update-ca-certificates

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/user-home" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser
USER appuser

# Create the grafisearch.csv in the user's home directory.
RUN touch /user-home/grafisearch.csv

# Copy the executable from the "build" stage.
COPY --from=build /bin/server /bin/

# Expose the port that the application listens on.
EXPOSE 8042

# What the container should run when it is started.
ENTRYPOINT [ "/bin/server" ]
