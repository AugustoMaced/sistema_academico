# Faculdade Connect

Aplicação mobile-first para comunicação entre alunos, professores e secretaria, com avisos e notícias.

## Stack
- Frontend: React + Vite + React Router + Axios + Socket.IO Client
- Backend: Node.js + Express + Prisma + SQLite + JWT + Socket.IO
- Notícias: arquitetura preparada para RSS/APIs externas

## Requisitos
- Node.js 20+
- npm

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

API: http://localhost:3333

Usuários de teste:
- aluno@faculdade.com / 123456
- professor@faculdade.com / 123456
- secretaria@faculdade.com / 123456

## 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente http://localhost:5173.

## 3. Funcionalidades

- Login com JWT
- Dashboard
- Conversas com professores
- Conversas com secretaria
- Mensagens
- Avisos
- Notícias de TI
- Notícias regionais via endpoint configurável
- Perfil
- Socket.IO preparado para mensagens em tempo real

## Observação sobre notícias regionais

O backend possui uma camada `newsService.js`. Ela usa feeds RSS configuráveis por ambiente. Para uma fonte regional específica, coloque a URL do feed/API em `REGIONAL_NEWS_URL`. Não é recomendado fazer scraping sem verificar os termos de uso da fonte.
