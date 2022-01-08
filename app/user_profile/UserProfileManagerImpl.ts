import { KeyValueStorage } from '../storage/KeyValueStorageInterface';
import {
  convertToAuthLevel,
  isValidPassword,
  isValudUsername,
  kAuthPenaltySec,
  kMaxTryCount,
  User,
} from './UserProfile';
import {
  ResultOk,
  kResultInvalid,
  ResultErrors,
  kResultNotFound,
} from '../base/error';
import { OtpAuthCrypto } from '../crypto/OtpAuthCrypto';
import { UserProfileManager } from './UserProfileManager';

//

function isNeededPenalty(tryCount: number): null | number {
  if (tryCount == 0 || kMaxTryCount <= 0) return null;
  if (tryCount % kMaxTryCount != 0) return null;

  const cnt = Math.min(8, tryCount / kMaxTryCount);
  const sec = kAuthPenaltySec * (1 << cnt);
  return Date.now() / 1000 + sec;
}

export class UserProfileManagerImpl implements UserProfileManager {
  private passStorage: KeyValueStorage;
  private passCrypto: OtpAuthCrypto;
  private testUserStartDate: number;

  constructor(passStorage: KeyValueStorage, passCrypto: OtpAuthCrypto) {
    // TODO: 抽象化 OtpAuthCrypto
    this.passStorage = passStorage;
    this.passCrypto = passCrypto;
    this.testUserStartDate = 0;
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
    const [passres, secret] = this.passCrypto.generateKey({ username });

    const res2 = await this.passStorage.insert(user.username, {
      username: user.username,
      secret,
      level,
      trycount: 0,
      startdate: undefined,
    });
    if (!res2.ok) {
      throw new Error('unexpected error: insert failed');
    }
    return { ok: true, otpauth_url: passres.otpauth_url };
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
    pass: string,
    incTryCount = true
  ): Promise<(ResultOk & User) | ResultErrors> {
    if (!isValudUsername(username) || !isValidPassword(pass)) {
      return kResultInvalid;
    }

    // We don't check for XX sec.
    // This is a weak protection for reverse brute force.
    const now = Math.floor(Date.now() / 1000);
    if (now < this.testUserStartDate) {
      return Object.assign(
        { detail: `try again ${this.testUserStartDate - now} sec later` },
        kResultInvalid
      );
    }
    this.testUserStartDate = now + 5;

    const res1 = await this.passStorage.get(username);
    if (!res1.ok || !res1.data) {
      return kResultInvalid;
    }
    const resUsername = res1.data.username;
    const resSecret = res1.data.secret;
    const resLevel = res1.data.level;
    const resTrycount = res1.data.trycount;
    const resStartDate = res1.data.startdate;

    if (typeof resUsername != 'string' || resUsername != username) {
      throw new Error('unexpected error: invalid DB username');
    }
    const level = convertToAuthLevel(resLevel);
    if (level === null || !resSecret) {
      throw new Error('unexpected error: invalid DB level');
    }

    if (resStartDate && now < resStartDate) {
      const left = resStartDate - Math.floor(now / 1000);
      return Object.assign(
        { detail: `try again ${left + 1} sec later` },
        kResultInvalid
      );
    }

    const res3 = this.passCrypto.verify(pass, resSecret as string);
    if (!res3) {
      if (incTryCount) {
        await this.setTryCount(
          resUsername,
          resSecret,
          resLevel,
          resTrycount - 0 + 1
        );
      }
      return kResultInvalid;
    }
    if (incTryCount && resTrycount) {
      await this.setTryCount(resUsername, resSecret, resLevel, undefined);
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

  private async setTryCount(
    username: string,
    secret: string,
    level: number,
    nextTryCount: number | undefined
  ): Promise<ResultOk | ResultErrors> {
    if (!isValudUsername(username)) {
      return kResultInvalid;
    }
    const startdate = nextTryCount ? isNeededPenalty(nextTryCount) : undefined;
    const data = {
      username,
      secret,
      level,
      trycount: nextTryCount,
      startdate: startdate ? startdate : undefined,
    };
    const res1 = await this.passStorage.update(username, data);
    if (!res1.ok) {
      throw new Error('unexpected error: ');
    }
    return { ok: true };
  }
}
