// db.js
const mysql = require('mysql2');

// Criar um pool de conexões
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Lu181922',
    database: 'ProjetoFinal',
    port: '3306' //catolica: 3307
});
 
pool.getConnection((err, connection) => {
    if (err) console.error("Erro ao conectar no banco de dados:", err.message || err);
    if (connection) console.log("Conexão com o banco de dados estabelecida com sucesso!");
    if (connection) connection.release();
});

// Exporta pool com promises (é assim que o usuário deve estar usando também)
module.exports = pool.promise();
