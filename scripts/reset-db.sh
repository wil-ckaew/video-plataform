#!/bin/bash
set -e

echo "⏳ Waiting for PostgreSQL..."
export PGPASSWORD="senha123"
while ! psql -U retesp -h db -d postgres -c "SELECT 1" > /dev/null 2>&1; do
  sleep 1
done

echo "♻️ Resetting database..."
psql -U retesp -h db -d postgres -c "DROP DATABASE IF EXISTS 4linhas_db;"
psql -U retesp -h db -d postgres -c "CREATE DATABASE 4linhas_db;"

echo "🔄 Applying migrations..."
export DATABASE_URL="postgres://retesp:senha123@db:5432/4linhas_db"
/app/migrate

echo "✅ Database ready!"