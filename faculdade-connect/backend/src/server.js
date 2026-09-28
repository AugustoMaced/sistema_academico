import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import newsRouter from './routes/news.js';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://192.168.56.1:5173' }
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://192.168.56.1:5173' }));
app.use(express.json());

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Não autenticado' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      semester: user.semester
    }
  });
});

app.get('/api/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, course: true, semester: true }
  });
  res.json(user);
});

app.get('/api/users/professors', auth, async (_, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'PROFESSOR' },
    select: { id: true, name: true, email: true }
  });
  res.json(users);
});

app.get('/api/announcements', auth, async (_, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { author: { select: { name: true } } }
  });
  res.json(announcements);
});

app.get('/api/conversations', auth, async (req, res) => {
  const rows = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.user.id } } },
    orderBy: { updatedAt: 'desc' },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });
  res.json(rows);
});

app.post('/api/conversations', auth, async (req, res) => {
  const { recipientId, type, subject, content } = req.body;
  const recipient = await prisma.user.findUnique({ where: { id: Number(recipientId) } });
  if (!recipient) return res.status(404).json({ message: 'Destinatário não encontrado' });

  const conversation = await prisma.conversation.create({
    data: {
      type: type || 'PROFESSOR',
      subject,
      participants: {
        create: [{ userId: req.user.id }, { userId: recipient.id }]
      },
      messages: {
        create: { content, senderId: req.user.id }
      }
    },
    include: { messages: true }
  });

  io.to(`conversation:${conversation.id}`).emit('new-message', conversation.messages[0]);
  res.status(201).json(conversation);
});

app.get('/api/conversations/:id/messages', auth, async (req, res) => {
  const id = Number(req.params.id);
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: req.user.id }
  });
  if (!participant) return res.status(403).json({ message: 'Sem acesso' });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true } } }
  });
  res.json(messages);
});

app.post('/api/conversations/:id/messages', auth, async (req, res) => {
  const id = Number(req.params.id);
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: req.user.id }
  });
  if (!participant) return res.status(403).json({ message: 'Sem acesso' });

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: req.user.id, content: req.body.content },
    include: { sender: { select: { id: true, name: true } } }
  });

  io.to(`conversation:${id}`).emit('new-message', message);
  res.status(201).json(message);
});

io.on('connection', socket => {
  socket.on('join-conversation', id => socket.join(`conversation:${id}`));
});

app.use('/api/news', newsRouter);

const port = process.env.PORT || 3333;
server.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
