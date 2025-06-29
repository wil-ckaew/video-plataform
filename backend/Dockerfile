# Use uma imagem base de Rust mais recente
# backend/Dockerfile
# Etapa de build
FROM rust:1.82 as builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release || true
COPY . .
RUN cargo build --release

# Etapa de produção
FROM debian:bookworm-slim

WORKDIR /app
RUN apt-get update && apt-get install -y libpq-dev pkg-config ca-certificates && apt-get clean

COPY --from=builder /app/target/release/backend /app/backend
COPY static /app/static
COPY uploads /app/uploads

CMD ["./backend"]