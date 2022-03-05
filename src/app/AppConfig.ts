import { PassCryptoMode } from '../crypto/PassCryptoProxy';
import yargs from 'yargs';

export interface AppConfig {
  port: string;
  domain: string;
  adminUserName: string | null;
  adminUserPass: string | null;
  storageType: 'mongo' | 'memory';
  storageDbName: string;
  passCryptoMode: PassCryptoMode;
  frontend: 'static' | 'webpack';
  mongodbDomain: string | null;
  sessionSecret: string;
}

function importAppConfigFromEnvInternal(): AppConfig {
  const argv = yargs(process.argv.slice(2))
    .usage('$0 [args]')
    // .command('lyr', 'Tells whether an year is leap year or not', {})
    .option('port', {
      alias: 'p',
      default: '8888',
      description: 'The port webserver listen',
      type: 'string',
    })
    .option('domain', {
      description:
        'NOTE: domain must have one or more ".". e.g., "localhost" will not work.',
      default: 'app.localhost',
      type: 'string',
    })

    .option('frontend', {
      choices: ['webpack', 'static'],
      default: 'static',
      type: 'string',
    })

    .option('admin-username', {
      description:
        // 'Specify the administrator. The administrator user will be created if it does not exist.',
        'Create the administrator if it does not exist',
      // TODO: admin は指定されたアカウントだけ有効、としたい
      // 現在の実装では、自身のアカウントを削除できず、かつ同じ権限のアカウントも削除できないため、
      // うまく動かない。
      // requiresArg: true,
      type: 'string',
    })
    // TODO: consider crypto-type
    .option('create-user-admin-password', {
      description:
        // 'Specify the administrator. The administrator user will be created if it does not exist.',
        'Create the administrator with the password if it does not exist',
      default: 'root',
      type: 'string',
    })
    .option('create-user-admin-crypto', {
      description: 'Crypto type to be used when administrator will be created',
      choices: ['otpauth', 'pass', 'nopass'],
      default: 'otpauth',
      type: 'string',
    })

    .option('storage', {
      choices: ['memory', 'mongo'],
      default: 'mongo',
      description: 'Select storage implementation. "memory" is not persistent.',
      type: 'string',
    })

    .option('storage', {
      choices: ['memory', 'mongo'],
      default: 'mongo',
      description: 'Select storage implementation. "memory" is not persistent.',
      type: 'string',
    })
    .option('storage-dbname', {
      default: 'authserver',
      description: 'The name of database.',
      type: 'string',
    })
    .option('mongodb-domain', {
      description: 'The domain of mongodb e.g. "root:example@127.0.0.1:27017"',
      type: 'string',
    })
    .option('session-secret', {
      default: 'everything_is_omochi',
      type: 'string',
    })
    .help().argv;

  const port = argv['port'] || '8888';
  const domain = argv['domain'] || 'app.localhost';

  const frontend = argv['frontend'] == 'webpack' ? 'webpack' : 'static';

  const adminUserName = argv['admin-username'] || 'root'; // TODO: How to validate requiresArg on yargs
  const adminUserPass = argv['create-user-admin-password'] || 'root';
  const passCryptoMode =
    argv['create-user-admin-crypto'] == 'otpauth'
      ? 'otpauth'
      : argv['create-user-admin-crypto'] == 'nopass'
      ? 'nopass'
      : 'pass';

  const storageType = argv['storage'] == 'memory' ? 'memory' : 'mongo';
  const storageDbName = argv['storage-dbname'] || 'authserver';
  const mongodbDomain = argv['mongodb-domain'] || null;
  const sessionSecret = argv['session-secret'] || 'everything_is_omochi';

  return {
    port,
    domain,
    adminUserName,
    adminUserPass,
    storageType,
    storageDbName,
    passCryptoMode,
    frontend,
    mongodbDomain,
    sessionSecret,
  };
}

export const AppConfig = importAppConfigFromEnvInternal();
