import "./instrument";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { HttpAdapterHost } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";
import helmet from "helmet";
import { AppModule } from "./app.module";

const DEFAULT_CORS_ORIGINS = [
  "https://les-extras.com",
  "https://www.les-extras.com",
  "https://desk.les-extras.com",
  "https://api.les-extras.com",
];

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) {
    return DEFAULT_CORS_ORIGINS;
  }

  const parsed = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_CORS_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = parseCorsOrigins();

  app.enableCors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
  });

  app.use(helmet());

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new SentryGlobalFilter(app.get(HttpAdapterHost)));
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
