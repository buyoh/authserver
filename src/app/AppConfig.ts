export interface AppConfig {
  port: string;
  adminUsername: string;
}

export function importAppConfigFromEnv(): AppConfig {
  const adminUsername = process.env.ADMIN_USERNAME as string;
  const port = (process.env.PORT as string) || '8888';
  if (!adminUsername) {
    console.error('env.ADMIN_USERNAME is empty');
    process.exit(2);
  }
  return {
    adminUsername,
    port,
  };
}
