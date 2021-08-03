import { KeyValueStorage } from '../storage/KeyValueStorageInterface';
import * as Speakeasy from 'speakeasy'; // TODO: replace this module. not maintained
import * as crypto from 'crypto';

//

// ### purpose
// - ユーザ情報を与えられたストレージへ保存・取得する
// - secretを外部に出さない
// - 鍵の照合を行う

//

export const AuthLevelMember = 21;
export const AuthLevelFull = 1;

// TODO: hide
export type AuthLevel = typeof AuthLevelFull | typeof AuthLevelMember;

export interface User {
  username: string;
  level: AuthLevel;
  // no secret
}

function convertToAuthLevel(maybeLevel: any): null | AuthLevel {
  // nanikore format...
  return typeof maybeLevel != 'number'
    ? null
    : maybeLevel == AuthLevelFull
    ? AuthLevelFull
    : maybeLevel == AuthLevelMember
    ? AuthLevelMember
    : null;
}

//

function isValudUsername(username: string) {
  return /^[a-zA-Z0-9_-]{2,20}$/.test(username);
}

function isValidPassword(password: string) {
  return 5 <= password.length && password.length <= 200;
}

//

export class UserProfileManager {
  passStorage: KeyValueStorage;
  constructor(passStorage: KeyValueStorage) {
    this.passStorage = passStorage;
  }

  async addUser(user: User): Promise<null | string> {
    // TODO: return User
    // TODO: check valid user level
    const { username, level } = user;
    if (!isValudUsername(username)) {
      console.log('invalid username');
      return null;
    }
    const res1 = await this.passStorage.get(username);
    if (res1.ok) {
      return null; // TODO: define type
    }
    const secret = Speakeasy.generateSecret({
      length: 32,
      name: crypto.randomUUID() + ':' + username,
    });

    const res2 = await this.passStorage.insert(user.username, {
      username: user.username,
      secret: secret.base32,
      level,
    });
    if (!res2.ok) {
      return null;
    }
    return secret.otpauth_url;
  }

  async getUser(username: string): Promise<User | null> {
    if (!isValudUsername(username)) {
      return null;
    }
    const res1 = await this.passStorage.get(username);
    if (!res1.ok || !res1.data) {
      return null;
    }
    return { username: res1.data.username, level: res1.data.level };
  }

  async allUsers(): Promise<Array<User>> {
    const res = await this.passStorage.all();
    if (!res.ok) {
      // TODO: notify error
      return [];
    }
    return res.data.map((raw) => ({
      username: raw.data.username,
      level: raw.data.level,
    }));
  }

  async testUser(username: string, pass: string): Promise<null | User> {
    if (!isValudUsername(username) || !isValidPassword(pass)) {
      return null;
    }
    const res1 = await this.passStorage.get(username);
    if (!res1.ok || !res1.data) {
      return null;
    }
    const resUsername = res1.data.username;
    const resSecret = res1.data.secret;
    const resLevel = res1.data.level;

    if (typeof resUsername != 'string' || resUsername != username) {
      return null;
    }
    const level = convertToAuthLevel(resLevel);
    if (level === null) {
      return null;
    }
    if (!resSecret) {
      return null;
    }
    const secretBase32 = resSecret as string;

    const res3 = Speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: pass,
    });
    if (!res3) {
      // invalid;
      return null;
    }
    return {
      username: resUsername,
      level,
    };
  }

  async deleteUser(username: string): Promise<true | null> {
    if (!isValudUsername(username)) {
      return null;
    }
    const res1 = await this.passStorage.erase(username);
    if (!res1.ok) {
      return null;
    }
    return true;
  }
}
