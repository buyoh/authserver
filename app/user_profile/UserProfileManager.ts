import { KeyValueStorage } from '../storage/KeyValueStorageInterface';
import * as Speakeasy from 'speakeasy'; // TODO: replace this module. not maintained
import * as crypto from 'crypto';
import {
  convertToAuthLevel,
  isValidPassword,
  isValudUsername,
  User,
} from './UserProfile';
import {
  ResultOk,
  kResultInvalid,
  ResultErrors,
  kResultNotFound,
} from '../base/error';

//

// ### purpose
// - ユーザ情報を与えられたストレージへ保存・取得する
// - secretを外部に出さない
// - 鍵の照合を行う

//

export class UserProfileManager {
  passStorage: KeyValueStorage;
  constructor(passStorage: KeyValueStorage) {
    this.passStorage = passStorage;
  }

  async addUser(
    user: User
  ): Promise<(ResultOk & { otpauth_url: string }) | ResultErrors> {
    // TODO: return User
    // TODO: check valid user level
    const { username, level } = user;
    if (!isValudUsername(username)) {
      console.log('invalid username');
      return kResultInvalid;
    }
    const res1 = await this.passStorage.get(username);
    if (res1.ok) {
      // already exists
      return kResultInvalid;
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
      throw new Error('unexpected error: insert failed');
    }
    return { ok: true, otpauth_url: secret.otpauth_url };
  }

  async getUser(username: string): Promise<(ResultOk & User) | ResultErrors> {
    if (!isValudUsername(username)) {
      return kResultInvalid;
    }
    const res1 = await this.passStorage.get(username);
    if (!res1.ok || !res1.data) {
      return kResultNotFound;
    }
    return { ok: true, username: res1.data.username, level: res1.data.level };
  }

  async allUsers(): Promise<(ResultOk & { data: Array<User> }) | ResultErrors> {
    const res = await this.passStorage.all();
    if (!res.ok) {
      throw new Error('unexpected error: ');
    }
    const li = res.data.map((raw) => ({
      username: raw.data.username,
      level: raw.data.level,
    }));
    return { ok: true, data: li };
  }

  async testUser(
    username: string,
    pass: string
  ): Promise<(ResultOk & User) | ResultErrors> {
    if (!isValudUsername(username) || !isValidPassword(pass)) {
      return kResultInvalid;
    }
    const res1 = await this.passStorage.get(username);
    if (!res1.ok || !res1.data) {
      return kResultInvalid;
    }
    const resUsername = res1.data.username;
    const resSecret = res1.data.secret;
    const resLevel = res1.data.level;

    if (typeof resUsername != 'string' || resUsername != username) {
      return kResultInvalid;
    }
    const level = convertToAuthLevel(resLevel);
    if (level === null || !resSecret) {
      throw new Error('unexpected error: ');
    }
    const secretBase32 = resSecret as string;

    const res3 = Speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: pass,
    });
    if (!res3) {
      return kResultInvalid;
    }
    return {
      ok: true,
      username: resUsername,
      level,
    };
  }

  async deleteUser(username: string): Promise<ResultOk | ResultErrors> {
    if (!isValudUsername(username)) {
      return kResultInvalid;
    }
    const res1 = await this.passStorage.erase(username);
    if (!res1.ok) {
      throw new Error('unexpected error: ');
    }
    return { ok: true };
  }
}
