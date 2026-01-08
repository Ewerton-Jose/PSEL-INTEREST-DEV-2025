#! /usr/bin/env bash

set -e
set -x

echo "===== Starting prestart script ====="

# Let the DB start
echo "Running backend_pre_start.py..."
python app/backend_pre_start.py

# Run migrations
echo "Running alembic upgrade head..."
alembic upgrade head
echo "Alembic migrations completed."

# Create initial data in DB
echo "Running initial_data.py..."
python app/initial_data.py
echo "Initial data script completed."

echo "===== Prestart script finished successfully ====="
