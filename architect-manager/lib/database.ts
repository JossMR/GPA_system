import mysql from 'mysql2/promise';

// Configuración ultra-básica para evitar ANY warnings de MySQL2
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'GPA',
  // SOLO las opciones más básicas para evitar warnings
  connectionLimit: 10,
});

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

// Función para ejecutar consultas de forma segura usando el pool directamente
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T> {
  try {
    // Usar el pool directamente evita warnings de configuración en conexiones individuales
    const [results] = await pool.execute(query, params);
    return results as T;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Función alternativa que usa conexiones del pool (para casos específicos)
export async function executeQueryWithConnection<T = any>(
  query: string, 
  params: any[] = []
): Promise<T> {
  const connection = await getConnection();
  
  try {
    const [results] = await connection.execute(query, params);
    return results as T;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    console.error('Query:', query);
    console.error('Params:', params);
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
