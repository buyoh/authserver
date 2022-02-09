import { PassCryptoMode } from '../crypto/PassCryptoProxy';
import yargs from 'yargs';

export interface AppConfig {
  port: string;
  adminUsername: string | null;
  storageType: 'mongo' | 'memory';
  passCryptoMode: PassCryptoMode;
  frontend: 'static' | 'webpack';
  mongodbDomain: string | null;
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
    .option('storage', {
      choices: ['memory', 'mongo'],
      default: 'mongo',
      description: 'Select storage implementation. "memory" is not persistent.',
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
        'Create the administrator user if it does not exist',
      requiresArg: true,
      type: 'string',
    })
    .option('admin-crypto', {
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
    .option('mongodb-domain', {
      description: 'The domain of mongodb e.g. "root:example@127.0.0.1:27017"',
      type: 'string',
    })
    .help().argv;

  const port = argv['port'] || '8888';
  const adminUsername = argv['admin-username'] || 'root'; // TODO: How to validate requiresArg on yargs
  const storageType = argv['storage'] == 'memory' ? 'memory' : 'mongo';
  const frontend = argv['frontend'] == 'webpack' ? 'webpack' : 'static';
  const mongodbDomain = argv['mongodb-domain'] || null;
  const passCryptoMode =
    argv['admin-crypto'] == 'otpauth'
      ? 'otpauth'
      : argv['admin-crypto'] == 'nopass'
      ? 'nopass'
      : 'pass';

  return {
    port,
    adminUsername,
    storageType,
    passCryptoMode,
    frontend,
    mongodbDomain,
  };
}

// TODO: 現状は AppMain にのみ依存されるようになっているが、
// appからであれば、どこからでも依存されても良いように、ルールを変える。
export const AppConfig = importAppConfigFromEnvInternal();
