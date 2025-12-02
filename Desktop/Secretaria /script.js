// ... no seu arquivo principal, após a linha const db = require('./db');
const db = require('./db'); // chama a conexão com o banco

// Teste de conexão:
db.getConnection()
  .then(connection => {
    console.log("Conectou ao banco com sucesso!");
    connection.release(); // Libera a conexão de volta para o pool

    // VINCULAR O SEU SERVIDOR SOMENTE APÓS A CONEXÃO BEM-SUCEDIDA
    app.listen(port, () => {
        // Lembre-se de usar uma porta diferente do MySQL (ex: 3000)
        console.log(`Servidor Express funcionando na porta ${port}!`);
    });
  })
  .catch(err => {
    console.error("ERRO FATAL: Falha ao conectar ao banco de dados.", err.message);
    process.exit(1); // Encerra o processo se a conexão falhar
  });

// ... (remova o app.listen antigo, se for usar este bloco)