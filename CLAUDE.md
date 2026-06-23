# AGENTS.md

This file provides guidance to AI agents (Claude Code, OpenCode, etc.) when working with code in this repository.

## Commands

### Development
```bash
# Start full development environment (requires parallel, gow, templ, bun)
make dev

# Individual development commands
bun run dev          # Start Vite dev server (port 3000)
templ generate       # Generate Go templates
go run .             # Run Go server (port 8042)
```

### Build & Test
```bash
# Full build process
make local-research     # or: bun run build && templ generate && go build

# TypeScript/Preact
bun run build        # Build frontend assets
bun run check        # TypeScript type checking (tsc -b)
bun run test         # Run Vitest tests

# Go
go test ./...        # Run Go tests
go build            # Build Go binary
```

### Installation
```bash
make install         # Build and install as system service
./local-research install # Install service directly
```

## Architecture

### Tech Stack
- **Backend**: Go web server (port 8042) with embedded assets
- **Frontend**: Preact + TypeScript + Vite
- **Templates**: Go templ for server-side rendering
- **Styling**: CSS modules in `assets/css/`

### Project Structure
- `main.go`: Entry point, HTTP server setup, route definitions
- `server/`: Go server handlers (search, weather, SSE, API endpoints)
- `search/`: Search engine parsers (Google, DuckDuckGo, Brave)
- `templates/`: Go templ templates for SSR
- `assets/`: Frontend TypeScript/Preact code
  - `components/`: Preact components
  - `functions/`: Utility functions and middleware
  - `hooks/`: Custom React hooks
  - `pages/`: Page components
- `public/`: Static assets served directly
- `install/`: Service installation files (macOS plist, Linux systemd)

### Key Features
- **Search Aggregation**: Fetches and reformats results from multiple search engines
- **Bangs Support**: Custom search shortcuts (!rt, !wrenfr, etc.)
- **Instant Answers**: Timer, calculator via middleware system
- **Wallpaper Management**: Dynamic background system with API
- **Blocklist**: Filters out unwanted sites (defined in `search/blocklist.go`)

### Build Process
1. Frontend assets are built with Vite to `public/assets/`
2. Go templates are generated from `.templ` files
3. Go binary embeds the entire `public/` directory
4. Single binary contains both server and all assets

### API Endpoints
- `/api/google`, `/api/ddg`, `/api/brave`: Search endpoints
- `/api/wallpaper`: Wallpaper management
- `/sse`: Server-sent events for real-time updates
- `/weather`: Weather information page
