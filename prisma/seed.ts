import { PrismaClient } from "@prisma/client";

import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test user with password "password123"
    const hashedPassword = await hash('password123', 10);
    
    console.log('Creating test user...');
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'user',
      },
    });

    // Create a test user with OTP enabled
    console.log('Creating OTP user...');
    await prisma.user.upsert({
      where: { email: 'otp@example.com' },
      update: {},
      create: {
        email: 'otp@example.com',
        name: 'OTP User',
        password: hashedPassword,
        role: 'user',
        useOtp: true,
      },
    });

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });