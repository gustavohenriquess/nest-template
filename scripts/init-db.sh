#!/bin/bash

# Este script cria múltiplos bancos de dados no PostgreSQL/Bitnami
# Baseado na variável de ambiente POSTGRESQL_MULTIPLE_DATABASES

set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating database '$database'..."
	export PGPASSWORD="$POSTGRESQL_PASSWORD"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRESQL_USERNAME" --dbname "$POSTGRESQL_DATABASE" <<-EOSQL
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRESQL_USERNAME;
EOSQL
}

if [ -n "$POSTGRESQL_MULTIPLE_DATABASES" ]; then
	echo "Multiple database creation requested: $POSTGRESQL_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRESQL_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database $db
	done
	echo "Multiple databases created"
fi
