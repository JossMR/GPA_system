docker compose down --volumes --remove-orphans --rmi all
docker builder prune -a -f
docker system prune -a --volumes -f

docker compose build --no-cache db
docker compose up -d

docker compose exec db mysql -uroot -padmin -e "SHOW VARIABLES LIKE 'lower_case_table_names';"