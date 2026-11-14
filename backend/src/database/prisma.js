import { PrismaClient } from '@prisma/client';
import env from '../config/env.js';

let prisma;

const prismaOptions = {
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
};

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.__prisma;
}

export default prisma;

