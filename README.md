# 🎓 Faculdade Connect

O **Faculdade Connect** é um sistema web desenvolvido com o objetivo de facilitar e centralizar a comunicação entre **alunos, professores e secretaria** da faculdade.

A proposta principal é oferecer uma plataforma simples, acessível pelo celular e que reúna em um único lugar as principais necessidades de comunicação do ambiente acadêmico.

## 💡 Ideia do projeto

A ideia surgiu pensando em uma situação comum dentro das faculdades: a comunicação entre alunos, professores e secretaria muitas vezes acontece por diferentes canais.

O Faculdade Connect busca centralizar essa comunicação em um único sistema, permitindo que o aluno possa:

* 💬 Conversar com professores;
* 🏢 Entrar em contato com a secretaria;
* 📩 Enviar e receber mensagens;
* 📢 Receber avisos importantes;
* 📰 Acompanhar novidades da área de TI;
* 📍 Acompanhar notícias da região.

O foco principal do projeto é a **comunicação acadêmica**.

---

## 🚀 Funcionalidades

### 👨‍🎓 Área do aluno

* Login e autenticação;
* Visualização do perfil;
* Comunicação com professores;
* Comunicação com a secretaria;
* Histórico de conversas;
* Recebimento de avisos;
* Visualização de notícias.

### 👨‍🏫 Área de comunicação

* Conversas individuais;
* Envio e recebimento de mensagens;
* Comunicação em tempo real;
* Separação entre professores e secretaria.

### 📢 Avisos

Área destinada a comunicados importantes da faculdade, permitindo centralizar informações que precisam chegar aos alunos.

### 💻 Notícias de TI

Área destinada a novidades e notícias relacionadas à tecnologia e desenvolvimento de software.

### 📰 Notícias da região

Área destinada a notícias e informações relevantes da região, utilizando uma fonte externa de notícias configurável.

---

## 🛠️ Tecnologias utilizadas

### Frontend

* React
* Vite
* React Router
* Axios
* Socket.IO Client
* JavaScript
* CSS

### Backend

* Node.js
* Express
* Prisma ORM
* JWT
* Socket.IO
* bcrypt
* RSS Parser

### Banco de dados

* SQLite

A estrutura foi desenvolvida de forma que o banco possa ser substituído posteriormente por outra solução, como PostgreSQL.

---

## 🏗️ Estrutura do projeto

```text
faculdade-connect/
│
├── backend/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   └── news.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

# ⚙️ Como executar o projeto

## 1. Pré-requisitos

Antes de começar, é necessário ter instalado:

* [Node.js](https://nodejs.org/)
* npm

Recomenda-se utilizar uma versão recente do Node.js.

---

## 2. Clonar o repositório

Entre na pasta:

```bash
cd faculdade-connect
```

---

# 🔧 Configurando o Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` baseado no `.env.example`:

```bash
Copy-Item .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

O arquivo `.env` deverá conter:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
PORT=3333
FRONTEND_URL="http://localhost:5173"

TECH_NEWS_URL="https://feeds.feedburner.com/TechCrunch/"

REGIONAL_NEWS_URL=""
```

---

## 🗄️ Criando o banco de dados

Execute:

```bash
npx prisma migrate dev --name init
```

Depois execute o seed:

```bash
npm run seed
```

O seed cria usuários para teste e uma conversa inicial.

---

## ▶️ Executando o Backend

Execute:

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3333
```

Para verificar se está funcionando:

```text
http://localhost:3333/api/health
```

A resposta esperada é:

```json
{
  "ok": true
}
```

---

# 💻 Configurando o Frontend

Abra outro terminal.

A partir da pasta principal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```bash
Copy-Item .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

O arquivo deverá conter:

```env
VITE_API_URL=http://localhost:3333/api
VITE_SOCKET_URL=http://localhost:3333
```

---

## ▶️ Executando o Frontend

Execute:

```bash
npm run dev
```

O Vite irá disponibilizar a aplicação, normalmente em:

```text
http://localhost:5173
```

---

# 🔐 Usuários para teste

O projeto possui usuários criados automaticamente pelo seed.

### Aluno

```text
E-mail: aluno@faculdade.com
Senha: 123456
```

### Professor

```text
E-mail: professor@faculdade.com
Senha: 123456
```

### Secretaria

```text
E-mail: secretaria@faculdade.com
Senha: 123456
```

> ⚠️ Esses usuários são apenas para desenvolvimento e testes. Não devem ser utilizados em produção.

---

# 🔌 Principais endpoints da API

### Autenticação

```http
POST /api/auth/login
```

### Usuário

```http
GET /api/me
```

### Professores

```http
GET /api/users/professors
```

### Avisos

```http
GET /api/announcements
```

### Conversas

```http
GET  /api/conversations
POST /api/conversations
```

### Mensagens

```http
GET  /api/conversations/:id/messages
POST /api/conversations/:id/messages
```

### Notícias

```http
GET /api/news/ti
GET /api/news/regiao
```

---

# 📱 Foco em dispositivos móveis

O projeto foi pensado desde o início com uma abordagem **mobile-first**, priorizando uma experiência simples para utilização pelo celular.

A interface possui:

* Navegação inferior;
* Layout responsivo;
* Interface simplificada;
* Área de comunicação de fácil acesso;
* Estrutura preparada para evolução para PWA.

---

# 🔄 Comunicação em tempo real

O sistema utiliza **Socket.IO** para permitir comunicação em tempo real.

Quando uma nova mensagem é enviada, o backend pode emitir o evento para os usuários conectados à conversa.

```text
Aluno
  │
  │ envia mensagem
  ▼
Backend
  │
  │ Socket.IO
  ▼
Professor
```

Isso permite que o sistema evolua futuramente para uma experiência de chat mais completa.

---

# 📰 Integração com notícias

As notícias são obtidas através de feeds externos configurados no backend.

A arquitetura permite trocar a fonte sem precisar modificar o frontend.

```text
Fonte de notícias
       ↓
    Backend
       ↓
      API
       ↓
    React
       ↓
 Aplicativo
```

Para notícias regionais, é necessário configurar uma fonte/API ou feed RSS compatível e verificar seus termos de uso.

---

# 🔮 Próximos passos

O projeto ainda está em desenvolvimento e algumas funcionalidades podem ser evoluídas.

Entre os próximos objetivos estão:

* [ ] Sistema completo de permissões;
* [ ] Área específica para professores;
* [ ] Área específica para secretaria;
* [ ] Solicitações para a secretaria;
* [ ] Status das solicitações;
* [ ] Notificações;
* [ ] Melhorias no chat;
* [ ] Upload de arquivos nas conversas;
* [ ] PWA para instalação no celular;
* [ ] Melhorias de segurança;
* [ ] Deploy do frontend e backend;
* [ ] Migração do banco para PostgreSQL em produção.

---

# 🎯 Objetivo do projeto

Além de ser uma aplicação prática, o Faculdade Connect está sendo desenvolvido como uma oportunidade de colocar em prática conhecimentos de:

* Desenvolvimento Web;
* React;
* JavaScript;
* APIs REST;
* Banco de Dados;
* Autenticação;
* Comunicação em tempo real;
* Integração com APIs externas;
* Arquitetura Frontend + Backend.

---

## 👨‍💻 Desenvolvedor

**Augusto Macedo**

Projeto desenvolvido para estudo, prática e construção de portfólio na área de desenvolvimento de software.


🔗 **GitHub:**
https://github.com/SEU-USUARIO/faculdade-connect
