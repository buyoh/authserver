export interface AppConfig {
  port: string;
  adminUsername: string;
  storageType: 'mongo' | 'memory';
  frontend: 'static' | 'webpack';
  mongodbDomain?: string;
}

function importAppConfigFromEnvInternal(): AppConfig {
  // TODO: use command-line-args
  const port = (process.env.PORT as string) || '8888';
  const adminUsername = process.env.ADMIN_USERNAME as string;
  const storageType = process.env.DBTYPE == 'memory' ? 'memory' : 'mongo';
  const frontend = process.env.FRONTEND == 'webpack' ? 'webpack' : 'static';
  const mongodbDomain = process.env.MONGODB_DOMAIN || undefined;

  if (!adminUsername) {
    console.error('env.ADMIN_USERNAME is empty');
    process.exit(2);
  }

  return {
    adminUsername,
    port,
    storageType,
    frontend,
    mongodbDomain,
  };
}

// TODO: 現状は AppMain にのみ依存されるようになっているが、
// appからであれば、どこからでも依存されても良いように、ルールを変える。
export const AppConfig = importAppConfigFromEnvInternal();
