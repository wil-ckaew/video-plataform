# Use uma imagem base de Rust mais recente
#FROM rust:1.82
FROM rust:latest

RUN apt-get update && \
    apt-get install -y ffmpeg

# Define o diretório de trabalho
WORKDIR /usr/src/transcoder

# Copia os arquivos de configuração do Cargo
COPY Cargo.toml Cargo.lock ./

# Copia o código-fonte
COPY src/ ./src/

# Compila a aplicação
RUN cargo build --release

# Comando para executar a aplicação
CMD ["./target/release/transcoder"]  