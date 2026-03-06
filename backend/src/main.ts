import 'dotenv/config';
import { createServer } from 'node:net';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const isPortAvailable = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });

const resolvePort = async (preferredPort: number): Promise<number> => {
  for (let port = preferredPort; port <= preferredPort + 20; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No free port found in range ${preferredPort}-${preferredPort + 20}`);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const preferredPort = Number(process.env.PORT ?? 5000);
  const port = await resolvePort(preferredPort);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  if (port !== preferredPort) {
    console.warn(
      `Port ${preferredPort} is busy. Backend started on port ${port} instead.`,
    );
  }

  await app.listen(port);
}
bootstrap();
