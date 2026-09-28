import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const aluno = await prisma.user.upsert({
    where: { email: 'aluno@faculdade.com' },
    update: {},
    create: {
      name: 'Augusto Macedo',
      email: 'aluno@faculdade.com',
      passwordHash,
      role: 'ALUNO',
      course: 'Análise e Desenvolvimento de Sistemas',
      semester: 6
    }
  });

  const professor = await prisma.user.upsert({
    where: { email: 'professor@faculdade.com' },
    update: {},
    create: {
      name: 'Prof. João Silva',
      email: 'professor@faculdade.com',
      passwordHash,
      role: 'PROFESSOR'
    }
  });

  const secretaria = await prisma.user.upsert({
    where: { email: 'secretaria@faculdade.com' },
    update: {},
    create: {
      name: 'Secretaria Acadêmica',
      email: 'secretaria@faculdade.com',
      passwordHash,
      role: 'SECRETARIA'
    }
  });

  const exists = await prisma.announcement.findFirst();

  if (!exists) {
    await prisma.announcement.create({
      data: {
        title: 'Bem-vindo ao Faculdade Connect',
        content:
          'Use o aplicativo para falar com professores e secretaria e acompanhar os avisos da faculdade.',
        audience: 'TODOS',
        authorId: secretaria.id
      }
    });
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: 'PROFESSOR',
      subject: 'Dúvida sobre a atividade',
      participants: {
        create: [
          { userId: aluno.id },
          { userId: professor.id }
        ]
      },
      messages: {
        create: {
          content: 'Olá, professor! Tenho uma dúvida sobre a atividade.',
          senderId: aluno.id
        }
      }
    }
  });

  console.log('Seed concluído. Conversa:', conversation.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());