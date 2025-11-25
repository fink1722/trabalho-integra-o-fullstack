# Guia Passo a Passo - Integração Full-Stack com SQLite

## Índice
1. [Introdução](#introdução)
2. [O que você vai aprender](#o-que-você-vai-aprender)
3. [Estrutura Atual do Projeto](#estrutura-atual-do-projeto)
4. [Passos Detalhados](#passos-detalhados)
5. [Conceitos Importantes](#conceitos-importantes)

---

## Introdução

Este exercício ensina como conectar um front-end React com um back-end Node.js que utiliza banco de dados SQLite para **persistência de dados**.

**Persistência** significa que os dados não são perdidos quando o servidor é reiniciado, ao contrário do armazenamento em memória (array), que é temporário.

---

## O que você vai aprender

- Como substituir armazenamento em memória por um banco de dados SQLite
- Como criar e manipular tabelas em SQLite usando Node.js
- Como fazer operações CRUD (Create, Read) no banco de dados
- Como conectar front-end e back-end localmente
- Como testar a persistência de dados

---

## Estrutura Atual do Projeto

Você tem **duas pastas principais**:

### 1. `server-for-forms-main` (Back-end)
Esta pasta contém:

- **server.js**: O servidor Express que atualmente guarda dados em um array `let submissoes = []`
- **dashboard.html**: Página HTML que exibe as submissões recebidas
- **package.json**: Lista de dependências do projeto (express, cors)

**Problema atual**: Os dados são armazenados em memória (array). Quando você reinicia o servidor, todos os dados são perdidos.

### 2. `atividade-formulario-07-10-2025-main` (Front-end)
Esta pasta contém:

- **src/App.tsx**: Componente React com formulário que envia dados usando axios
- O formulário atualmente aponta para: `https://server-for-forms-zqx1.onrender.com/submit`

**Problema atual**: O formulário está enviando dados para um servidor remoto, não para o seu servidor local.

---

## Passos Detalhados

### ETAPA 1: Preparação do Ambiente

#### Passo 1.1: Instalar dependências do Back-end

**O que fazer:**
```bash
cd server-for-forms-main
npm install
```

**Por que:**
- Este comando instala as dependências listadas no `package.json` (Express e CORS)
- Express: framework para criar o servidor web
- CORS: permite que o front-end (React) se comunique com o back-end

---

#### Passo 1.2: Instalar o SQLite3

**O que fazer:**
```bash
npm install sqlite3
```

**Por que:**
- `sqlite3` é o driver (biblioteca) que permite ao Node.js se comunicar com bancos de dados SQLite
- SQLite é um banco de dados leve que armazena dados em um arquivo (não precisa de servidor separado)

---

#### Passo 1.3: Criar repositório no GitHub

**O que fazer:**
1. Acesse github.com e faça login
2. Clique em "New repository"
3. Dê um nome (ex: "integracao-fullstack-sqlite")
4. Marque como público
5. Não inicialize com README (você já tem código)
6. Clique em "Create repository"

**Por que:**
- Você precisa compartilhar seu código com o professor
- Git permite versionar e acompanhar mudanças no código
- Repositórios públicos podem ser acessados por qualquer pessoa

**Como subir o código:**
```bash
# Dentro da pasta server-for-forms-main
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/integracao-fullstack-sqlite.git
git push -u origin main
```

---

### ETAPA 2: Modificar o server.js para usar SQLite

Esta é a parte mais importante do exercício. Você vai transformar o armazenamento em memória para banco de dados.

#### Passo 2.1: Importar o módulo SQLite3

**O que fazer:**
No início do arquivo `server.js`, adicione:

```javascript
const sqlite3 = require('sqlite3').verbose();
```

**Onde colocar:**
Logo após as importações existentes:
```javascript
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // ADICIONAR AQUI
```

**Por que:**
- Importa a biblioteca SQLite3 para poder usá-la no código
- `.verbose()` ativa mensagens detalhadas de debug (ajuda a identificar erros)

---

#### Passo 2.2: Criar/Conectar ao Banco de Dados

**O que fazer:**
Substitua a linha:
```javascript
let submissoes = [];
```

Por:
```javascript
// Cria ou abre o arquivo de banco de dados 'dados.db'
const db = new sqlite3.Database('./dados.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});
```

**Por que:**
- `new sqlite3.Database('./dados.db')` cria uma conexão com o banco
- Se o arquivo `dados.db` não existir, ele será criado automaticamente
- Se já existir, apenas abre a conexão
- O callback `(err) => {...}` é executado após a conexão
- Se houver erro, exibe no console; se não, confirma a conexão

---

#### Passo 2.3: Criar a Tabela de Submissões

**O que fazer:**
Logo após a conexão com o banco, adicione:

```javascript
// Cria a tabela 'submissoes' caso ela não exista
db.run(`
    CREATE TABLE IF NOT EXISTS submissoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dados TEXT NOT NULL,
        ip TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Erro ao criar tabela:', err.message);
    } else {
        console.log('Tabela "submissoes" pronta.');
    }
});
```

**Por que cada parte:**

- `CREATE TABLE IF NOT EXISTS`: Cria a tabela apenas se ela ainda não existir (evita erros ao reiniciar)
- `id INTEGER PRIMARY KEY AUTOINCREMENT`:
  - ID único para cada registro
  - PRIMARY KEY: identifica unicamente cada linha
  - AUTOINCREMENT: aumenta automaticamente (1, 2, 3...)

- `dados TEXT NOT NULL`:
  - Armazena os dados do formulário em formato JSON (texto)
  - NOT NULL: este campo é obrigatório

- `ip TEXT NOT NULL`:
  - Armazena o endereço IP de quem enviou

- `timestamp TEXT NOT NULL`:
  - Armazena a data e hora do envio

- `db.run()`: Executa comandos SQL que modificam o banco (CREATE, INSERT, UPDATE, DELETE)

---

#### Passo 2.4: Modificar a Rota POST /submit

**O que fazer:**
Substitua a função inteira da rota POST por:

```javascript
app.post('/submit', (req, res) => {
    // 1. Pega os dados enviados pelo formulário
    const dadosDoAluno = req.body;

    // 2. Captura IP e timestamp
    const ip = req.ip;
    const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    // 3. Converte os dados do formulário para JSON (texto)
    const dadosJSON = JSON.stringify(dadosDoAluno);

    // 4. Query SQL para inserir no banco
    const sql = `INSERT INTO submissoes (dados, ip, timestamp) VALUES (?, ?, ?)`;

    // 5. Executa a inserção
    db.run(sql, [dadosJSON, ip, timestamp], function(err) {
        if (err) {
            console.error('Erro ao inserir dados:', err.message);
            return res.status(500).json({ error: 'Erro ao salvar dados' });
        }

        console.log('Nova submissão salva no banco! ID:', this.lastID);
        console.log('IP:', ip);
        console.log('Dados:', dadosDoAluno);

        // 6. Retorna sucesso
        res.status(201).json({
            message: 'Dados recebidos e salvos com sucesso!',
            id: this.lastID
        });
    });
});
```

**Por que cada parte:**

1. **`const dadosDoAluno = req.body`**: Extrai os dados enviados pelo formulário React

2. **`const dadosJSON = JSON.stringify(dadosDoAluno)`**:
   - Converte o objeto JavaScript em texto JSON
   - SQLite armazena dados em formato TEXT, não em objetos
   - Exemplo: `{nome: "João"}` vira `'{"nome":"João"}'`

3. **`INSERT INTO submissoes (dados, ip, timestamp) VALUES (?, ?, ?)`**:
   - Comando SQL para inserir uma nova linha na tabela
   - `?` são placeholders (espaços reservados) para os valores
   - Evita SQL Injection (ataque de segurança)

4. **`db.run(sql, [dadosJSON, ip, timestamp], function(err) {...})`**:
   - Executa o comando SQL
   - O array `[dadosJSON, ip, timestamp]` substitui os `?` na ordem
   - `function(err)` é chamado após a inserção
   - `this.lastID` retorna o ID do registro inserido

5. **Por que usar `function` e não arrow function `=>`**:
   - Com `function`, o `this` se refere ao contexto do SQLite
   - `this.lastID` só funciona com `function`, não com `=>`

---

#### Passo 2.5: Modificar a Rota GET /submissoes

**O que fazer:**
Substitua a função inteira da rota GET por:

```javascript
app.get('/submissoes', (req, res) => {
    // 1. Query SQL para buscar todas as submissões, ordenadas da mais recente para a mais antiga
    const sql = `SELECT * FROM submissoes ORDER BY id DESC`;

    // 2. Executa a query
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar dados:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar dados' });
        }

        // 3. Transforma os dados de volta ao formato esperado pelo dashboard
        const submissoesFormatadas = rows.map(row => {
            return {
                dados: JSON.parse(row.dados), // Converte JSON (texto) de volta para objeto
                ip: row.ip,
                timestamp: row.timestamp
            };
        });

        // 4. Retorna os dados
        res.status(200).json(submissoesFormatadas);
    });
});
```

**Por que cada parte:**

1. **`SELECT * FROM submissoes ORDER BY id DESC`**:
   - `SELECT *`: Busca todas as colunas
   - `FROM submissoes`: Da tabela submissoes
   - `ORDER BY id DESC`: Ordena do maior ID para o menor (mais recentes primeiro)

2. **`db.all(sql, [], (err, rows) => {...})`**:
   - `db.all()`: Busca TODAS as linhas que correspondem à query
   - Retorna um array de objetos (rows)
   - Cada objeto representa uma linha da tabela

3. **`JSON.parse(row.dados)`**:
   - Converte o texto JSON de volta para objeto JavaScript
   - Exemplo: `'{"nome":"João"}'` vira `{nome: "João"}`
   - Necessário porque salvamos como texto no banco

4. **`rows.map(row => {...})`**:
   - Transforma cada linha do banco no formato que o dashboard espera
   - O dashboard espera um objeto com `dados`, `ip` e `timestamp`

---

#### Passo 2.6: Fechar conexão ao encerrar (OPCIONAL mas recomendado)

**O que fazer:**
Adicione no final do arquivo, antes do `app.listen()`:

```javascript
// Fecha a conexão com o banco ao encerrar o servidor
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco fechada.');
        process.exit(0);
    });
});
```

**Por que:**
- Fecha a conexão com o banco de dados de forma adequada ao pressionar Ctrl+C
- Evita corrupção de dados
- Boa prática de programação

---

### ETAPA 3: Modificar o Front-end para usar localhost

#### Passo 3.1: Alterar a URL da API no App.tsx

**O que fazer:**
No arquivo `src/App.tsx`, na linha 12, altere:

```typescript
// ANTES:
const API_URL = 'https://server-for-forms-zqx1.onrender.com/submit';

// DEPOIS:
const API_URL = 'http://localhost:4000/submit';
```

**Por que:**
- Atualmente o formulário envia para um servidor remoto (onrender.com)
- Você precisa enviar para o seu servidor local (localhost)
- `localhost` é o endereço do seu próprio computador
- Porta `4000` é onde seu servidor Express está rodando

---

### ETAPA 4: Testar a Integração

#### Passo 4.1: Iniciar o Back-end

**O que fazer:**
```bash
# Dentro da pasta server-for-forms-main
node server.js
```

**O que esperar no console:**
```
Conectado ao banco de dados SQLite.
Tabela "submissoes" pronta.
Servidor de controle rodando na porta 4000
Aguardando submissões dos alunos...
```

**Por que:**
- Inicia o servidor Express na porta 4000
- Conecta ao banco de dados (cria dados.db se não existir)
- Aguarda requisições do front-end

---

#### Passo 4.2: Iniciar o Front-end

**O que fazer:**
Em outro terminal:
```bash
# Dentro da pasta atividade-formulario-07-10-2025-main
npm install  # Se ainda não instalou as dependências
npm run dev
```

**O que esperar:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Por que:**
- Inicia o servidor de desenvolvimento do React (Vite)
- Permite acessar o formulário no navegador
- Geralmente roda na porta 5173

---

#### Passo 4.3: Enviar 3 submissões pelo formulário

**O que fazer:**
1. Abra http://localhost:5173/ no navegador
2. Preencha o formulário com dados diferentes 3 vezes
3. Clique em "Enviar Projeto" cada vez

**Exemplo de dados:**
- Submissão 1: Nome: "João Silva", Link: "https://github.com/joao/projeto1", Turma: "A"
- Submissão 2: Nome: "Maria Santos", Link: "https://github.com/maria/projeto2", Turma: "B"
- Submissão 3: Nome: "Pedro Oliveira", Link: "https://github.com/pedro/projeto3", Turma: "A"

**O que esperar:**
- Mensagem de sucesso após cada envio
- No console do back-end, deve aparecer:
```
Nova submissão salva no banco! ID: 1
IP: ::1
Dados: { nome: 'João Silva', link: '...', turma: 'A' }
```

---

#### Passo 4.4: Abrir o Dashboard

**O que fazer:**
1. Localize o arquivo `dashboard.html` na pasta `server-for-forms-main`
2. Clique duas vezes nele para abrir no navegador
3. OU arraste o arquivo para o navegador

**O que esperar:**
- Página mostrando "Total de submissões: 3"
- 3 cards exibindo os dados enviados
- Cada card mostra IP, timestamp e dados em formato JSON

**Por que:**
- O dashboard faz uma requisição GET para `http://localhost:4000/submissoes`
- O servidor busca os dados do banco SQLite
- O dashboard exibe em tempo real (atualiza a cada 3 segundos)

---

#### Passo 4.5: TESTE DA PERSISTÊNCIA (Mais Importante!)

**O que fazer:**
1. **No terminal do back-end**, pressione `Ctrl+C` para parar o servidor
2. Aguarde alguns segundos
3. Inicie o servidor novamente: `node server.js`
4. **No navegador**, atualize a página do dashboard (F5)

**O que esperar:**
- As 3 submissões anteriores **ainda devem estar lá**!
- Se estiverem, a persistência funcionou!

**Por que isso é importante:**
- Prova que os dados estão salvos no arquivo `dados.db`
- Se fosse apenas em memória (array), os dados teriam sumido
- Este é o objetivo principal do exercício: **persistência de dados**

---

### ETAPA 5: Enviar para o GitHub

#### Passo 5.1: Verificar o que mudou

**O que fazer:**
```bash
# Dentro da pasta server-for-forms-main
git status
```

**O que esperar:**
```
modified:   server.js
modified:   package.json
untracked:  dados.db
untracked:  node_modules/
```

**Por que:**
- Mostra quais arquivos foram modificados ou criados
- `dados.db` é o arquivo do banco de dados com suas submissões

---

#### Passo 5.2: Adicionar os arquivos ao commit

**O que fazer:**
```bash
git add server.js package.json package-lock.json dados.db
```

**Por que não adicionar node_modules:**
- `node_modules` contém milhares de arquivos das dependências
- É recriado com `npm install`
- Deixa o repositório muito pesado
- Por isso existe o arquivo `.gitignore`

---

#### Passo 5.3: Criar o commit

**O que fazer:**
```bash
git commit -m "Integração com SQLite para persistência de dados"
```

**Por que:**
- Cria um ponto de salvamento (snapshot) do código
- A mensagem explica o que foi feito
- Boa prática: mensagens claras e descritivas

---

#### Passo 5.4: Enviar para o GitHub

**O que fazer:**
```bash
git push origin main
```

**O que esperar:**
- Credenciais podem ser solicitadas
- Mensagem de sucesso ao final

**Por que:**
- Envia suas alterações locais para o repositório remoto no GitHub
- Permite que outros (professor) vejam seu código
- Backup na nuvem

---

## Conceitos Importantes

### 1. O que é Persistência de Dados?

**Armazenamento em Memória (ANTES):**
```javascript
let submissoes = []; // Array em memória RAM
```
- Dados existem apenas enquanto o servidor está rodando
- Ao reiniciar: `submissoes = []` (vazio novamente)
- Volátil (temporário)

**Armazenamento em Banco de Dados (DEPOIS):**
```javascript
db.run("INSERT INTO submissoes...");
```
- Dados salvos em arquivo (dados.db) no disco rígido
- Ao reiniciar: dados ainda estão lá
- Persistente (permanente)

---

### 2. Por que SQLite?

**Vantagens:**
- Não precisa de servidor separado (como MySQL ou PostgreSQL)
- Um único arquivo (dados.db)
- Perfeito para aprendizado e projetos pequenos
- Usado em aplicativos móveis (Android, iOS)

**Limitações:**
- Não ideal para muitos usuários simultâneos
- Sem recursos avançados de bancos corporativos
- Não recomendado para produção em escala grande

---

### 3. Diferença entre db.run() e db.all()

**db.run():** Para comandos que MODIFICAM o banco
```javascript
db.run("INSERT INTO..."); // Insere dados
db.run("UPDATE..."); // Atualiza dados
db.run("DELETE FROM..."); // Deleta dados
db.run("CREATE TABLE..."); // Cria tabela
```

**db.all():** Para comandos que CONSULTAM o banco
```javascript
db.all("SELECT * FROM..."); // Busca todas as linhas
```

**Também existe db.get():** Busca apenas UMA linha
```javascript
db.get("SELECT * FROM submissoes WHERE id = 1");
```

---

### 4. Por que usar JSON.stringify() e JSON.parse()?

**O problema:**
- JavaScript trabalha com objetos: `{nome: "João", turma: "A"}`
- SQLite armazena apenas tipos primitivos: TEXT, INTEGER, REAL, BLOB
- Não podemos salvar objetos diretamente

**A solução:**
```javascript
// Ao salvar (POST):
const dados = {nome: "João", turma: "A"}; // Objeto
const dadosTexto = JSON.stringify(dados); // '{"nome":"João","turma":"A"}' (texto)
db.run("INSERT INTO submissoes (dados) VALUES (?)", [dadosTexto]);

// Ao recuperar (GET):
db.all("SELECT * FROM submissoes", (err, rows) => {
    const objeto = JSON.parse(rows[0].dados); // Volta a ser objeto
});
```

---

### 5. O que são Placeholders (?) no SQL?

**NÃO faça assim (INSEGURO):**
```javascript
const nome = "João'; DROP TABLE submissoes; --"; // Ataque SQL Injection!
db.run(`INSERT INTO users (nome) VALUES ('${nome}')`); // PERIGOSO!
```

**Faça assim (SEGURO):**
```javascript
const nome = "João'; DROP TABLE submissoes; --";
db.run("INSERT INTO users (nome) VALUES (?)", [nome]); // Protegido
```

**Por que usar `?`:**
- SQLite trata o valor como dado, não como código SQL
- Previne SQL Injection (ataque que executa comandos maliciosos)
- Boa prática de segurança

---

### 6. CORS - Por que precisamos dele?

**O problema:**
- Front-end roda em: http://localhost:5173
- Back-end roda em: http://localhost:4000
- Navegadores bloqueiam requisições entre origens diferentes (segurança)

**A solução:**
```javascript
app.use(cors()); // Permite requisições de qualquer origem
```

**Em produção, você limitaria:**
```javascript
app.use(cors({
    origin: 'https://meusite.com' // Só permite deste domínio
}));
```

---

### 7. Estrutura de uma Requisição HTTP

**POST /submit (Front-end → Back-end):**
```
POST http://localhost:4000/submit
Headers: Content-Type: application/json
Body: {"nome": "João", "link": "...", "turma": "A"}

→ Back-end recebe em req.body
→ Salva no banco
→ Retorna: {message: "Sucesso!", id: 1}
```

**GET /submissoes (Dashboard → Back-end):**
```
GET http://localhost:4000/submissoes

→ Back-end busca no banco
→ Retorna: [{dados: {...}, ip: "::1", timestamp: "..."}]
→ Dashboard exibe os dados
```

---

## Checklist Final

Antes de entregar, verifique:

- [ ] O servidor inicia sem erros
- [ ] O arquivo `dados.db` foi criado
- [ ] O formulário React envia dados para localhost:4000
- [ ] O dashboard exibe as submissões
- [ ] Após reiniciar o servidor, os dados persistem
- [ ] O código foi enviado para o GitHub
- [ ] O repositório está público
- [ ] Você tirou prints conforme solicitado no exercício

---

## Estrutura Final do server.js

Aqui está um resumo da estrutura final do seu `server.js`:

```javascript
// 1. Importações
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// 2. Configurações
const app = express();
const PORT = 4000;

// 3. Conexão com o Banco
const db = new sqlite3.Database('./dados.db', (err) => {...});

// 4. Criação da Tabela
db.run(`CREATE TABLE IF NOT EXISTS submissoes (...)`, (err) => {...});

// 5. Middlewares
app.use(cors());
app.use(express.json());

// 6. Rotas
app.post('/submit', (req, res) => {
    // Inserir no banco
});

app.get('/submissoes', (req, res) => {
    // Buscar do banco
});

// 7. Fechar conexão ao encerrar (opcional)
process.on('SIGINT', () => {...});

// 8. Iniciar servidor
app.listen(PORT, () => {...});
```

---

## Dúvidas Comuns

**Q: O banco foi criado mas está vazio após reiniciar?**
A: Verifique se você está usando `db.run()` corretamente na rota POST. O erro pode estar na inserção.

**Q: Erro "CORS policy" no navegador?**
A: Certifique-se de que `app.use(cors())` está no código antes das rotas.

**Q: Dashboard não atualiza?**
A: Verifique se o servidor está rodando. O dashboard precisa do servidor ativo.

**Q: "Cannot find module 'sqlite3'"?**
A: Você esqueceu de rodar `npm install sqlite3`.

**Q: Dados salvos duplicados?**
A: Normal se você enviou o mesmo formulário várias vezes. Cada submissão gera um novo registro.

---

## Conclusão

Parabéns! Você agora sabe:

✅ Como conectar um front-end React com um back-end Node.js
✅ Como usar SQLite para persistir dados
✅ A diferença entre armazenamento em memória e banco de dados
✅ Como fazer operações CRUD básicas
✅ Como testar uma integração full-stack

Este conhecimento é fundamental para qualquer desenvolvedor web!

---

**Boa sorte no exercício! 🚀**
