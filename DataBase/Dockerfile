FROM mysql:8.0

COPY my.cnf /etc/mysql/conf.d/my.cnf
RUN chmod 644 /etc/mysql/conf.d/my.cnf
COPY 01_ScriptSchemaUser.sql /docker-entrypoint-initdb.d/sql/01_ScriptSchemaUser.sql
COPY 02_ScriptDB-GPA.sql /docker-entrypoint-initdb.d/sql/02_ScriptDB-GPA.sql
COPY 03_ScriptPermission.sql /docker-entrypoint-initdb.d/sql/03_ScriptPermission.sql
COPY initdb/01_bootstrap.sh /docker-entrypoint-initdb.d/01_bootstrap.sh

RUN chmod +x /docker-entrypoint-initdb.d/01_bootstrap.sh