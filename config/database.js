const mysql = require('mysql2');  // Importamos mysql2

// Crear un pool de conexiones a la base de datos MySQL
const db = mysql.createPool({
  host: 'localhost',             // Dirección del servidor MySQL
  user: 'root',                  // Nombre de usuario de la base de datos
  password: '',     // Contraseña de tu base de datos MySQL
  database: 'campuswork',        // Nombre de la base de datos
  waitForConnections: true,      // Espera conexiones si la base de datos está ocupada
  connectionLimit: 10,           // Número de conexiones simultáneas permitidas
  queueLimit: 0                  // Sin límite de cola
});

module.exports = db.promise();  // Exportamos la conexión con soporte para promesas
