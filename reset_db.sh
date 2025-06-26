#!/bin/bash

echo "⛔ Apagando banco de dados existente..."
docker exec -it db psql -U retesp -d postgres -c 'DROP DATABASE "4linhas_db";'

echo "✅ Criando novo banco de dados..."
docker exec -it db psql -U retesp -d postgres -c 'CREATE DATABASE "4linhas_db";'

echo "🚀 Aplicando migrações..."
cd backend
sqlx migrate run

echo "🎉 Banco de dados resetado com sucesso!"
