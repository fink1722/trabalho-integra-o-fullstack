const sqlite3 = require('sqlite3').verbose() 
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000; // A porta onde seu servidor vai rodar

// --- Armazenamento em Memória ---
// Um array simples para guardar as submissões.
// Em um projeto real, isso seria um banco de dados.
const db = new sqlite3.Database('./dados.db', (err) =>{
    if(err){
        console.error('Erro ao conectar ao banco de dados: ', err.message);
    }else{
        console.log('Conectando ao banco de dados SQLite. ');   
    }
});


db.run(`
    CREATE TABLE IF NOT EXISTS submissoes(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       dados TEXT NOT NULL,
       ip TEXT NOT NULL,
       timestamp TEXT NOT NULL
    )
`, (err) =>{
    if(err){
        console.error('Erro ao criar tabela:', err.mensagem);

    }else{
       console.log('Tabela "submissões" pronta. ');
    }

});


// --- Middlewares ---
app.use(cors()); // Permite que qualquer front-end acesse nossa API
app.use(express.json()); // Habilita o servidor a entender requisições com corpo em JSON
app.set('trust proxy', true); // Necessário para obter o IP correto se houver proxies no caminho

// --- Rotas (Endpoints) ---

/**
 * @route   POST /submit
 * @desc    Recebe os dados do formulário dos alunos.
 */
app.post('/submit', (req, res) =>{
    const dadosDoAluno = req.body;
    const ip = req.ip;
    const timestamp = new Date().toLocaleString("pr") 
    const dadosJSON = JSON.stringify(dadosDoAluno);
    
    const sql = `INSERT INTO submissoes (dados, ip, timestamp) VALUES (?, ?, ?)`;
    
    db.run(sql, [dadosJSON, ip, timestamp], function(err){
        if (err){
            console.error('Erro ao inserir dados:', err.mensagem);
            return res.status(500).json({error: 'Erro ao salvar dados' });
        }
        
        console.log('Nome submissão salva no banco! /n ID:', this.lastID)
        console.log('ip:', ip);
        console.log('Dados:', dadosDoAluno);
        
        res.status(201).json({
            message: 'Dados recebidos e salvos com sucesso!',
            id: this.lastID
        });



    });

    

});





/**
 * @route   GET /submissoes
 * @desc    Fornece a lista de todas as submissões para a página de controle.
 */
app.get('/submissoes', (req, res) => {
    
    const sql = 'select * from submissoes ORDER BY id DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err){
            console.error('Erro ao bsucar dados: ' , err.mensagem);
            return res.status(500).json({ error: 'Erro ao buscar dados' });
        }  
    
        const submissoesFormatadas = rows.map(row =>{
            return{
                dados: JSON.parse(row.dados),
                ip: row.ip,
                timestamp: row.timestamp
            };
        });
    
        
        res.status(200).json(submissoesFormatadas);
    });
   
});


// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor de controle rodando na porta ${PORT}`);
    console.log('Aguardando submissões dos alunos...');
});
