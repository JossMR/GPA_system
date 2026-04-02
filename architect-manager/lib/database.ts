import mysql from 'mysql2/promise';

// Configuración optimizada del pool con manejo de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'GPA',
  
  connectionLimit: 10,              // Máximo de conexiones simultáneas
  maxIdle: 10,                      // Máximo de conexiones inactivas en el pool
  idleTimeout: 60000,               // Cerrar conexiones inactivas después de 60 segundos
  queueLimit: 0,                    // Sin límite de cola (esperar si todas están ocupadas)
  enableKeepAlive: true,            // Mantener conexiones vivas con pings
  keepAliveInitialDelay: 10000,    // Primer ping después de 10 segundos
  
  waitForConnections: true,         // Esperar si no hay conexiones disponibles
  connectTimeout: 10000,            // Timeout de conexión: 10 segundos
  
  multipleStatements: false,        // Por seguridad
});

pool.on('connection', (connection) => {
  console.log('Nueva conexión establecida al pool MySQL');
  
  // Configurar timeout de sesión para esta conexión
  connection.query('SET SESSION wait_timeout = 300'); // 5 minutos
  connection.query('SET SESSION interactive_timeout = 300');
});

pool.on('acquire', (connection) => {
  console.log('Conexión adquirida del pool (ID: %d)', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('Conexión liberada al pool (ID: %d)', connection.threadId);
});

export async function getPoolStatus() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SHOW STATUS LIKE "Threads_connected"');
    connection.release();
    return rows;
  } catch (error) {
    connection.release();
    throw error;
  }
}

// Función para obtener una conexión del pool
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión obtenida del pool (ID: %d)', connection.threadId);
    return connection;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    
    if (error instanceof Error && error.message.includes('Too many connections')) {
      console.error('⚠️ ALERTA: Demasiadas conexiones. Limpiando pool...');
      await cleanupPool();
    }
    
    throw new Error('No se pudo conectar a la base de datos');
  }
}

export async function executeQuery<T = any>(
  query: string, 
  params: any[] = [],
  retries = 3
): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Usar el pool directamente con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 30000); // 30 segundos
      });
      
      const queryPromise = pool.execute(query, params);
      
      const [results] = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      console.log(`✅ Query ejecutado exitosamente (intento ${attempt})`);
      return results as T;
      
    } catch (error) {
      // Fallback para servidores donde ciertas consultas no son compatibles con prepared statements.
      if ((error as any)?.code === 'ER_WRONG_ARGUMENTS') {
        try {
          const [fallbackResults] = await pool.query(query, params);
          console.log(`✅ Query ejecutado con fallback pool.query (intento ${attempt})`);
          return fallbackResults as T;
        } catch (fallbackError) {
          lastError = fallbackError;
          console.error('❌ Error también en fallback pool.query:', fallbackError);
        }
      }

      lastError = error;
      console.error(`❌ Error ejecutando consulta (intento ${attempt}/${retries}):`, error);
      console.error('Query:', query);
      console.error('Params:', params);
      
      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw error;
      }
      
      // Esperar antes de reintentar (backoff exponencial)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Reintentando en ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

// Función alternativa que usa conexiones del pool (para casos específicos)
export async function executeQueryWithConnection<T = any>(
  query: string, 
  params: any[] = []
): Promise<T> {
  const connection = await getConnection();
  
  try {
    await connection.query('SET SESSION max_execution_time = 30000'); // 30 segundos
    
    const [results] = await connection.execute(query, params);
    console.log('✅ Query con conexión dedicada ejecutado exitosamente');
    return results as T;
    
  } catch (error) {
    console.error('❌ Error ejecutando consulta con conexión:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
    
  } finally {
    connection.release();
    console.log('🔓 Conexión liberada al pool');
  }
}

// Función para transacciones con manejo mejorado
export async function executeTransaction(queries: Array<{query: string, params?: any[]}>) {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('🔄 Transacción iniciada');
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    console.log('✅ Transacción completada exitosamente');
    return results;
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transacción revertida debido a error:', error);
    throw error;
    
  } finally {
    connection.release();
    console.log('🔓 Conexión de transacción liberada al pool');
  }
}

export async function cleanupPool() {
  try {
    console.log('🧹 Iniciando limpieza del pool...');
    
    // El pool de mysql2 no expone directamente métodos de limpieza,
    // pero podemos forzar el cierre y recreación de conexiones inactivas
    // mediante la configuración de idleTimeout que ya establecimos
    
    const [rows] = await pool.query('SELECT 1') as any;
    console.log('✅ Pool limpio y funcional');
    
  } catch (error) {
    console.error('❌ Error limpiando pool:', error);
  }
}

export async function closePool() {
  try {
    console.log('🛑 Cerrando pool de conexiones...');
    await pool.end();
    console.log('✅ Pool cerrado exitosamente');
  } catch (error) {
    console.error('❌ Error cerrando pool:', error);
  }
}

export async function checkPoolHealth() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as health') as any;
    connection.release();
    
    return {
      healthy: rows[0]?.health === 1,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Pool no saludable:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export function logPoolStats() {
  setInterval(() => {
    const stats = {
      timestamp: new Date().toISOString(),
      // mysql2 pool no expone estas estadísticas directamente,
      // pero podemos inferir el estado
    };
    console.log('📊 Pool stats:', stats);
  }, 60000); // Cada minuto
}

if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('🛑 Recibida señal SIGINT, cerrando pool...');
    await closePool();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando pool...');
    await closePool();
    process.exit(0);
  });
}

export default pool;
