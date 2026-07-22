type Environment = Record<string, unknown>;

function readString(value: unknown, name: string, fallback?: string): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value === 'string') return value;
  throw new Error(`${name} must be a string`);
}

export function validateEnvironment(config: Environment): Environment {
  const port = Number(config.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be a valid TCP port');
  }

  const databaseUrl = readString(config.DATABASE_URL, 'DATABASE_URL', '');
  if (!databaseUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }

  const sessionTtlDays = Number(config.SESSION_TTL_DAYS ?? 7);
  if (
    !Number.isInteger(sessionTtlDays) ||
    sessionTtlDays < 1 ||
    sessionTtlDays > 30
  ) {
    throw new Error('SESSION_TTL_DAYS must be an integer from 1 to 30');
  }

  return {
    ...config,
    NODE_ENV: readString(config.NODE_ENV, 'NODE_ENV', 'development'),
    PORT: port,
    FRONTEND_URL: readString(
      config.FRONTEND_URL,
      'FRONTEND_URL',
      'http://localhost:3000',
    ),
    DATABASE_URL: databaseUrl,
    SESSION_TTL_DAYS: sessionTtlDays,
  };
}
