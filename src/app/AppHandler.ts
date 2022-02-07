import {
  kResultForbidden,
  kResultInvalid,
  ResultErrors,
  ResultOk,
} from '../base/error';
import { ResourceProvider } from './ResourceProvider';
import {
  AuthLevel,
  AuthLevelAdmin,
  isEditableAuthLevel,
  isValidPassword,
  User,
} from '../user_profile/UserProfile';
import { AppUserSession } from './AppUserSession';
import { PassCryptoMode } from '../crypto/PassCryptoProxy';

export class AppHandler {
  private resource: ResourceProvider;

  constructor(resource: ResourceProvider) {
    this.resource = resource;
  }

  async login(
    session: AppUserSession,
    username: string,
    pass: string,
    crypto: PassCryptoMode
  ): Promise<ResultOk | ResultErrors> {
    // TODO: session 引数が参照渡しへの書き込みのために使っており、ナンセンス
    // TODO: require info how to crypto
    // TODO: pass ではなく、UserInputForVerify であるべき。
    // パスワード以外の何かを要求することは少ないと推測。
    // 現状のインターフェースでも影響は少なそう。
    if (!isValidPassword(pass)) return kResultInvalid;
    const userInputForVerify = {
      username,
      pass,
    };

    const res = await this.resource
      .getUserManager()
      .testUser(username, crypto, userInputForVerify);
    if (res.ok === false) {
      return res;
    }
    session.username = res.username;
    session.level = res.level;
    return { ok: true };
  }

  async logout(session: AppUserSession): Promise<ResultOk | ResultErrors> {
    session.setInvalid();
    return { ok: true };
  }

  async getUser(
    session: AppUserSession,
    username: string
  ): Promise<(ResultOk & User) | ResultErrors> {
    const res = await this.resource.getUserManager().getUser(username);
    return res;
  }

  async getUsers(session: AppUserSession): Promise<
    | (ResultOk & {
        data: Array<{ username: string; level: AuthLevel; me: boolean }>;
      })
    | ResultErrors
  > {
    const res1 = await this.resource.getUserManager().allUsers();
    if (res1.ok === false) {
      return res1;
    }
    return {
      ok: true,
      data: res1.data.map((e) => ({
        username: e.username,
        level: e.level,
        me: e.username === session.username,
      })),
    };
  }

  async createUser(
    session: AppUserSession,
    username: string,
    crypto: PassCryptoMode,
    pass: string,
    level: AuthLevel
  ): Promise<(ResultOk & { otpauth_url: string }) | ResultErrors> {
    // TODO: require info how to crypto
    if (!isEditableAuthLevel(session.level, level)) {
      return kResultForbidden;
    }
    const res1 = await this.resource
      .getUserManager()
      .addUser({ username, level }, crypto, { username, pass });
    if (res1.ok === false) {
      return res1;
    }
    // TODO: remove the dependency of otpauth
    const otpauth_url = (res1.result as any).otpauth_url;
    return { ok: true, otpauth_url };
  }

  async deleteUser(
    session: AppUserSession,
    username: string
  ): Promise<ResultOk | ResultErrors> {
    const m = this.resource.getUserManager();
    // get user for level
    const res1 = await m.getUser(username);
    if (res1.ok === false) {
      return res1;
    }
    if (
      !isEditableAuthLevel(session.level, res1.level) ||
      res1.level === AuthLevelAdmin
    ) {
      return kResultForbidden;
    }
    const res2 = await m.deleteUser(username);
    if (res2.ok === false) {
      return res2;
    }
    return { ok: true };
  }
}
