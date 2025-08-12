import mysql from 'mysql2/promise';

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'GPA',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de conexiones (más eficiente que conexiones individuales)
const pool = mysql.createPool(dbConfig);

// Función para obtener una conexión del pool
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}

// Función para ejecutar consultas de forma segura
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T> {
  const connection = await getConnection();
  
  try {
    const [results] = await connection.execute(query, params);
    return results as T;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  } finally {
    connection.release(); // Importante: liberar la conexión
  }
}

// Función para transacciones
export async function executeTransaction(queries: Array<{query: string, params?: any[]}>) {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
