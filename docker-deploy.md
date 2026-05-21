# Para limpiar los volumenes de docker
docker compose down --volumes --remove-orphans --rmi all
docker builder prune -a -f
docker system prune -a --volumes -f

docker compose build --no-cache db
docker compose up -d
# Revisión de que acepta mayusculas para los nombre de las tablas
docker compose exec db mysql -uroot -padmin -e "SHOW VARIABLES LIKE 'lower_case_table_names';"

# Deploy
## Renombrar los contenedores
docker tag mysql:latest gpa/db:1.0
docker tag gpa_system-architect-manager:latest gpa/app:1.0
## Exportar ambas imagenes juntas
docker save -o gpa-system-1.0.tar gpa/db:1.0 gpa/app:1.0

## En caso de querer exportar los datos de la base de datos a un sql
docker compose -p gpa up -d db
docker compose -p gpa exec db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --databases GPA' > gpa.sql

# Deploy Cliente
## Cargar Imagenes
docker load -i gpa-system-1.0.tar
docker images
## Levantar contenedores(Requiere el docker-compose.deploy.yml)
docker compose -p gpa_system -f docker-compose.deploy.yml up -d

## En caso de haber exportado datos y querer importarlos
docker compose -f docker-compose.deploy.yml exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < gpa.sql

## Verificaciones
docker compose -f docker-compose.deploy.yml ps
docker compose -f docker-compose.deploy.yml logs -f db
docker compose -f docker-compose.deploy.yml exec db mysql -uroot -padmin -e "SHOW VARIABLES LIKE 'lower_case_table_names';"