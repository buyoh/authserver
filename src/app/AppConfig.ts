export interface AppConfig {
  port: string;
  adminUsername: string;
  storageType: 'mongo' | 'memory';
  mongodbDomain?: string;
}

export function importAppConfigFromEnv(): AppConfig {
  // TODO: use command-line-args
  const port = (process.env.PORT as string) || '8888';
  const adminUsername = process.env.ADMIN_USERNAME as string;
  const storageType = process.env.DBTYPE == 'memory' ? 'memory' : 'mongo';
  const mongodbDomain = process.env.MONGODB_DOMAIN || undefined;

  if (!adminUsername) {
    console.error('env.ADMIN_USERNAME is empty');
    process.exit(2);
  }

  return {
    adminUsername,
    port,
    storageType,
    mongodbDomain,
  };
}
