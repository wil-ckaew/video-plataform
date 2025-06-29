#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER retesp WITH PASSWORD 'senha123';
    CREATE DATABASE linhas4_db;
    GRANT ALL PRIVILEGES ON DATABASE linhas4_db TO retesp;
EOSQL