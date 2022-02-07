import { KeyValueStorage } from '../storage/KeyValueStorageInterface';
import {
  AuthLevel,
  convertToAuthLevel,
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
  ResultInvalid,
} from '../base/error';
import { UserProfileManager } from './UserProfileManager';
import {
  getPassCryptoInstance,
  PassCryptoMode,
} from '../crypto/PassCryptoProxy';

//

// database に実際に格納するためのデータ
// 型検査をするための wrapper
type UserProfile = {
  username: string;
  passCryptoMode: string;
  secret: any;
  level: AuthLevel;
  trycount: number;
  startdate: number | undefined;
};

// TODO: classize as StorageWrapper
function dbInsert(
  passStorage: KeyValueStorage,
  username: string,
  profile: UserProfile
) {
  return passStorage.insert(username, profile);
}

function dbUpdate(
  passStorage: KeyValueStorage,
  username: string,
  profile: UserProfile
) {
  return passStorage.update(username, profile);
}

//

function isNeededPenalty(tryCount: number): null | number {
  if (tryCount == 0 || kMaxTryCount <= 0) return null;
  if (tryCount % kMaxTryCount != 0) return null;

  const cnt = Math.min(8, tryCount / kMaxTryCount);
  const sec = kAuthPenaltySec * (1 << cnt);
  return Date.now() / 1000 + sec;
}

//

export class UserProfileManagerImpl implements UserProfileManager {
  private passStorage: KeyValueStorage;
  private testUserStartDate: number;

  constructor(passStorage: KeyValueStorage) {
    this.passStorage = passStorage;
    this.testUserStartDate = 0;
  }

  async addUser(
    user: User,
    passCryptoMode: PassCryptoMode,
    userInputForGenerate: object
  ): Promise<(ResultOk & { result: object }) | ResultErrors> {
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

    // TODO: { ...userInputForGenerate, username }
    // userInputForGenerate に username などの情報を取り込みたいことは想定される設計だが、
    // どのタイミングで取り込むべき？引数や interface として User の枠を用意すべき？
    const crypto = getPassCryptoInstance(passCryptoMode);
    const res = crypto.generate({ ...userInputForGenerate, username });
    if (res instanceof Error) return kResultInvalid;
    const { secret, result } = res;

    const res2 = await dbInsert(this.passStorage, user.username, {
      username: user.username,
      passCryptoMode: passCryptoMode,
      secret,
      level,
      trycount: 0,
      startdate: undefined,
    });
    if (!res2.ok) {
      throw new Error('unexpected error: insert failed');
    }
    return { ok: true, result };
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
    passCryptoMode: PassCryptoMode,
    userInputForVerify: object
  ): Promise<(ResultOk & User) | (ResultInvalid & {})> {
    // TODO: 試行回数を増加させないようなケースがある？
    // 不要なら削除する
    const incTryCount = true;

    if (!isValudUsername(username)) {
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
    const resPassCryptoMode = res1.data.passCryptoMode;
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

    if (passCryptoMode !== resPassCryptoMode) {
      if (incTryCount) {
        await this.setTryCount(
          resUsername,
          resSecret,
          resPassCryptoMode,
          resLevel,
          resTrycount - 0 + 1
        );
      }
      return kResultInvalid;
    }

    // TODO: { ...userInputForGenerate, username }
    // userInputForGenerate に username などの情報を取り込みたいことは想定される設計だが、
    // どのタイミングで取り込むべき？引数や interface として User の枠を用意すべき？
    const crypto = getPassCryptoInstance(passCryptoMode);
    const res3 = crypto.verify(
      { ...resSecret, username: resUsername },
      userInputForVerify
    );
    if (!res3) {
      if (incTryCount) {
        await this.setTryCount(
          resUsername,
          resSecret,
          resPassCryptoMode,
          resLevel,
          resTrycount - 0 + 1
        );
      }
      return kResultInvalid;
    }
    if (incTryCount && resTrycount) {
      await this.setTryCount(
        resUsername,
        resSecret,
        resPassCryptoMode,
        resLevel,
        undefined
      );
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

  // TODO: pass UserStorage
  private async setTryCount(
    username: string,
    secret: string,
    passCryptoMode: string,
    level: AuthLevel,
    nextTryCount: number | undefined
  ): Promise<ResultOk | ResultErrors> {
    if (!isValudUsername(username)) {
      return kResultInvalid;
    }
    const startdate = nextTryCount ? isNeededPenalty(nextTryCount) : undefined;
    const data = {
      username,
      secret,
      passCryptoMode,
      level,
      trycount: nextTryCount,
      startdate: startdate ? startdate : undefined,
    };
    const res1 = await dbUpdate(this.passStorage, username, data);
    if (!res1.ok) {
      throw new Error('unexpected error: ');
    }
    return { ok: true };
  }
}
