import { AppStorage } from '../storage/AppStorageInterface';
import * as Speakeasy from 'speakeasy';
import * as crypto from 'crypto';

function isValudUsername(username: string) {
  return /^[a-zA-Z0-9_-]{2,20}$/.test(username);
}

function isValidPassword(password: string) {
  return 5 <= password.length && password.length <= 200;
}

export class UserProfileManager {
  passStorage: AppStorage;
  constructor(passStorage: AppStorage) {
    this.passStorage = passStorage;
  }

  addUser(username: string): null | string {
    if (!isValudUsername(username)) {
      return null;
    }
    const res1 = this.passStorage.find(username);
    if (res1.ok) {
      return null; // TODO: define type
    }
    const secret = Speakeasy.generateSecret({
      length: 32,
      name: crypto.randomUUID() + ':' + username,
    });
    const res2 = this.passStorage.update(username, {
      username,
      secret: secret.base32,
    });
    if (!res2.ok) {
      return null;
    }
    return secret.otpauth_url;
  }

  testUser(username: string, pass: string): boolean {
    if (!isValudUsername(username) || !isValidPassword(pass)) {
      return false;
    }
    return true;
    // const res1 = this.passStorage.find(username);
    // if (!res1.ok || !res1.data) {
    //   return false;
    // }
    // const secretBase32 = res1.data.secret as string | null;
    // if (!secretBase32) {
    //   return false;
    // }

    // const res3 = Speakeasy.totp.verify({
    //   secret: secretBase32,
    //   encoding: 'base32',
    //   token: pass,
    // });
    // if (!res3) {
    //   // invalid;
    //   return false;
    // }
    // return true;
  }

  deleteUser() {
    // TODO:
  }
}
