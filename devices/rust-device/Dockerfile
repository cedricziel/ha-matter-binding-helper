# Build stage
FROM rust:slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libdbus-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests first for dependency caching
COPY Cargo.toml Cargo.lock* ./

# Create dummy source structure to cache dependencies
RUN mkdir -p src/bin src/clusters && \
    echo "pub mod clusters; pub mod config; pub mod mdns;" > src/lib.rs && \
    echo "pub mod binding;" > src/clusters/mod.rs && \
    echo "" > src/clusters/binding.rs && \
    echo "" > src/config.rs && \
    echo "" > src/mdns.rs && \
    echo "fn main() {}" > src/bin/dimmable_light.rs

# Build dependencies only (this layer will be cached)
RUN cargo build --release --bin dimmable_light 2>/dev/null || true

# Copy actual source and rebuild
COPY src ./src
RUN touch src/lib.rs && cargo build --release --bin dimmable_light

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies for mDNS and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 \
    ca-certificates \
    libdbus-1-3 \
    && rm -rf /var/lib/apt/lists/*

# Create data directory for persistence
RUN mkdir -p /data

# Copy binary
COPY --from=builder /app/target/release/dimmable_light /usr/local/bin/

# Default environment
ENV MATTER_DISCRIMINATOR=3840 \
    MATTER_PASSCODE=20202021 \
    MATTER_PORT=5540 \
    MATTER_PERSIST_PATH=/data/matter.bin \
    MATTER_DEVICE_NAME="Test Dimmable Light" \
    RUST_LOG=info

EXPOSE 5540/udp

ENTRYPOINT ["dimmable_light"]
