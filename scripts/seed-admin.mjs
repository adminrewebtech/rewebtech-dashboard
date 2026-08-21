import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before seeding.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { name, passwordHash },
    create: { name, email: email.toLowerCase().trim(), passwordHash },
  });

  console.log(`Admin user ready: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
