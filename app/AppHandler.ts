import { kResultForbidden, ResultErrors, ResultOk } from './base/error';
import { ResourceProvider } from './ResourceProvider';
import {
  AuthLevel,
  AuthLevelAdmin,
  isEditableAuthLevel,
  User,
} from './user_profile/UserProfile';
import { AppUserSession } from './AppUserSession';

export class AppHandler {
  private resource: ResourceProvider;

  constructor(resource: ResourceProvider) {
    this.resource = resource;
  }

  async login(
    session: AppUserSession,
    username: string,
    pass: string
  ): Promise<ResultOk | ResultErrors> {
    const res = await this.resource
      .getUserManager()
      .testUser(username, pass, true);
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
    level: AuthLevel
  ): Promise<(ResultOk & { otpauth_url: string }) | ResultErrors> {
    if (!isEditableAuthLevel(session.level, level)) {
      return kResultForbidden;
    }
    const res1 = await this.resource
      .getUserManager()
      .addUser({ username, level });
    if (!res1.ok) {
      return res1;
    }
    return { ok: true, otpauth_url: res1.otpauth_url };
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
