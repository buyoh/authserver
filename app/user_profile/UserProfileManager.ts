import { KeyValueStorage } from '../storage/KeyValueStorageInterface';
import * as Speakeasy from 'speakeasy'; // TODO: replace this module. not maintained
import * as crypto from 'crypto';

function isValudUsername(username: string) {
  return /^[a-zA-Z0-9_-]{2,20}$/.test(username);
}

function isValidPassword(password: string) {
  return 5 <= password.length && password.length <= 200;
}

export class UserProfileManager {
  passStorage: KeyValueStorage;
  constructor(passStorage: KeyValueStorage) {
    this.passStorage = passStorage;
  }

  async addUser(username: string): Promise<null | string> {
    if (!isValudUsername(username)) {
      console.log('invalid username');
      return null;
    }
    const res1 = await this.passStorage.get(username);
    if (res1.ok) {
      console.log(res1.data);
      console.log('already exist');
      return null; // TODO: define type
    }
    const secret = Speakeasy.generateSecret({
      length: 32,
      name: crypto.randomUUID() + ':' + username,
    });

    const res2 = await this.passStorage.insert(username, {
      username,
      secret: secret.base32,
    });
    if (!res2.ok) {
      console.log('already exist 2');
      return null;
    }
    return secret.otpauth_url;
  }

  async testUser(username: string, pass: string): Promise<boolean> {
    if (!isValudUsername(username) || !isValidPassword(pass)) {
      return false;
    }
    const res1 = await this.passStorage.get(username);
    if (!res1.ok || !res1.data) {
      return false;
    }
    const secretBase32 = res1.data.secret as string | null;
    if (!secretBase32) {
      return false;
    }

    const res3 = Speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: pass,
    });
    if (!res3) {
      // invalid;
      return false;
    }
    return true;
  }

  async deleteUser() {
    // TODO:
  }
}
