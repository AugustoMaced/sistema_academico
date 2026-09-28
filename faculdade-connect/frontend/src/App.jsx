import React from "react";
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from './api';

function useAuth() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

function Layout({ children }) {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  const items = [
    ['/', '⌂', 'Início'],
    ['/comunicacao', '💬', 'Comunicação'],
    ['/noticias', '📰', 'Notícias'],
    ['/perfil', '👤', 'Perfil']
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <strong>Faculdade Connect</strong>
          <small>Olá, {user?.name?.split(' ')[0]}</small>
        </div>
        <button className="icon-button" onClick={logout}>↪</button>
      </header>
      <main>{children}</main>
      <nav className="bottom-nav">
        {items.map(([path, icon, label]) => (
          <Link className={location.pathname === path ? 'active' : ''} to={path} key={path}>
            <span>{icon}</span><small>{label}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Protected({ children }) {
  return localStorage.getItem('token') ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function Login() {
  const [email, setEmail] = useState('aluno@faculdade.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao entrar');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">🎓</div>
        <h1>Faculdade Connect</h1>
        <p>Comunicação acadêmica em um só lugar.</p>
        <form onSubmit={submit}>
          <label>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <label>Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
          {error && <div className="error">{error}</div>}
          <button className="primary">Entrar</button>
        </form>
        <small>Teste: aluno@faculdade.com / 123456</small>
      </div>
    </div>
  );
}

function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [tech, setTech] = useState([]);

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data));
    api.get('/news/ti').then(r => setTech(r.data));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <span>🎓</span>
        <div><h2>Seu espaço acadêmico</h2><p>Fale com professores e secretaria.</p></div>
      </section>

      <div className="quick-grid">
        <Link to="/comunicacao" className="quick-card">💬<b>Comunicação</b><small>Professores e secretaria</small></Link>
        <Link to="/noticias" className="quick-card">📰<b>Notícias</b><small>TI e região</small></Link>
      </div>

      <SectionTitle title="📢 Avisos" link="/avisos" />
      {announcements.length ? announcements.slice(0, 3).map(a => (
        <article className="card" key={a.id}>
          <b>{a.title}</b><p>{a.content}</p><small>{a.author.name}</small>
        </article>
      )) : <Empty text="Nenhum aviso no momento." />}

      <SectionTitle title="💻 Novidades de TI" link="/noticias" />
      {tech.slice(0, 3).map(n => <NewsCard key={n.link} item={n} />)}
      {!tech.length && <Empty text="Configure um feed de notícias de TI no backend." />}
    </div>
  );
}

function SectionTitle({ title, link }) {
  return <div className="section-title"><h3>{title}</h3><Link to={link}>Ver tudo</Link></div>;
}

function Empty({ text }) { return <div className="empty">{text}</div>; }

function Communication() {
  const [professors, setProfessors] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('PROFESSOR');
  const user = useAuth();

  useEffect(() => {
    api.get('/users/professors').then(r => setProfessors(r.data));
    api.get('/conversations').then(r => setConversations(r.data));
  }, []);

  async function send() {
    if (!recipient || !content.trim()) return;
    const { data } = await api.post('/conversations', {
      recipientId: Number(recipient), type, subject: 'Nova mensagem', content
    });
    setConversations(prev => [data, ...prev]);
    setContent('');
    setRecipient('');
  }

  return (
    <div className="page">
      <h2>💬 Comunicação</h2>
      <p className="muted">O principal canal entre você, professores e secretaria.</p>

      <div className="card">
        <h3>Nova conversa</h3>
        <label>Destinatário</label>
        <select value={recipient} onChange={e => setRecipient(e.target.value)}>
          <option value="">Selecione</option>
          {professors.map(p => <option value={p.id} key={p.id}>👨‍🏫 {p.name}</option>)}
          {user?.role === 'ALUNO' && <option value="3">🏢 Secretaria Acadêmica</option>}
        </select>
        <label>Mensagem</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Digite sua mensagem..." />
        <button className="primary" onClick={send}>Enviar mensagem</button>
      </div>

      <SectionTitle title="Conversas recentes" link="/comunicacao" />
      {conversations.map(c => {
        const other = c.participants?.find(p => p.userId !== user.id)?.user;
        return (
          <Link to={`/conversa/${c.id}`} className="conversation card" key={c.id}>
            <div className="avatar">{other?.name?.[0] || '?'}</div>
            <div><b>{other?.name || 'Conversa'}</b><p>{c.messages[0]?.content}</p></div>
          </Link>
        );
      })}
    </div>
  );
}

function Conversation() {
  const { id } = useParams();
  const user = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get(`/conversations/${id}/messages`).then(r => setMessages(r.data));
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333');
    socket.emit('join-conversation', Number(id));
    socket.on('new-message', msg => setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
    return () => socket.disconnect();
  }, [id]);

  async function send(e) {
    e.preventDefault();
    if (!content.trim()) return;
    const { data } = await api.post(`/conversations/${id}/messages`, { content });
    setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
    setContent('');
  }

  return (
    <div className="page chat-page">
      <Link to="/comunicacao" className="back">← Comunicação</Link>
      <h2>💬 Conversa</h2>
      <div className="messages">
        {messages.map(m => (
          <div className={`message ${m.senderId === user.id ? 'mine' : ''}`} key={m.id}>
            <small>{m.sender.name}</small><div>{m.content}</div>
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={send}>
        <input value={content} onChange={e => setContent(e.target.value)} placeholder="Digite uma mensagem..." />
        <button>➤</button>
      </form>
    </div>
  );
}

function News() {
  const [tech, setTech] = useState([]);
  const [regional, setRegional] = useState([]);
  useEffect(() => {
    api.get('/news/ti').then(r => setTech(r.data));
    api.get('/news/regiao').then(r => setRegional(r.data));
  }, []);

  return (
    <div className="page">
      <h2>📰 Notícias</h2>
      <SectionTitle title="💻 Tecnologia" link="/noticias" />
      {tech.map(n => <NewsCard key={n.link} item={n} />)}
      {!tech.length && <Empty text="Nenhuma notícia de TI disponível." />}
      <SectionTitle title="📍 Região" link="/noticias" />
      {regional.map(n => <NewsCard key={n.link} item={n} />)}
      {!regional.length && <Empty text="Configure REGIONAL_NEWS_URL no backend." />}
    </div>
  );
}

function NewsCard({ item }) {
  return (
    <a className="news-card card" href={item.link} target="_blank" rel="noreferrer">
      <div><span className="tag">{item.category}</span><h3>{item.title}</h3><p>{item.description?.slice(0, 150)}</p></div>
      <span>→</span>
    </a>
  );
}

function Profile() {
  const user = useAuth();
  return (
    <div className="page">
      <h2>👤 Perfil</h2>
      <div className="profile-card">
        <div className="big-avatar">{user?.name?.[0]}</div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <div className="profile-info"><b>Perfil</b><span>{user?.role}</span></div>
        <div className="profile-info"><b>Curso</b><span>{user?.course || '—'}</span></div>
        <div className="profile-info"><b>Período</b><span>{user?.semester || '—'}</span></div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Home /></Protected>} />
      <Route path="/comunicacao" element={<Protected><Communication /></Protected>} />
      <Route path="/conversa/:id" element={<Protected><Conversation /></Protected>} />
      <Route path="/noticias" element={<Protected><News /></Protected>} />
      <Route path="/perfil" element={<Protected><Profile /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
