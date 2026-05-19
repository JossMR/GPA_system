#!/bin/sh
set -eu

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" < /docker-entrypoint-initdb.d/sql/01_ScriptSchemaUser.sql
mysql -ugpa_system -pcontrasena gpa < /docker-entrypoint-initdb.d/sql/02_ScriptDB-GPA.sql
mysql -ugpa_system -pcontrasena gpa < /docker-entrypoint-initdb.d/sql/03_ScriptPermission.sql