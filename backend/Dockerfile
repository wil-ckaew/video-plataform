# Use uma imagem base de Rust mais recente
FROM rust:1.82

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de configuração do Cargo
COPY Cargo.toml Cargo.lock ./

# Copia o código-fonte
COPY src/ ./src/

# Compila a aplicação
RUN cargo build --release

# Comando para executar a aplicação
CMD ["./target/release/backend"]  # Substitua por "backend" com o nome correto do binário se necessário
