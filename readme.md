docker-compose up -d

Conectarse con MysqlWorkbench
en una conección nueva utilizar la contraseña "admin"

Crear la base de datos con el siguiente script
ScriptSchemeUser.sql

Luego de iniciar sesión en la base de datos gpa_system con la contraseña "contrasena" crear las tablas con el siguiente script
Recordad dar doble click y que se ponga en enfoque en el esquema gpa en la pestaña de esquemas antes de ejecutarlo.
ScriptDB-GPA.sql

Remplazar los datos del usuario y ejecutar el script
ScriptPermission.sql

npm install
npm install -g pnpm

pnpm install mysql2
pnpm install @react-oauth/google@latest
pnpm install jsonwebtoken
pnpm install google-auth-library
pnpm i --save-dev @types/jsonwebtoken

pnpm install exceljs
pnpm install exceljs file-saver
pnpm install --save-dev @types/file-saver
pnpm install exceljs file-saver date-fns

dentro de architect-manager ejecutar
pnpm run dev