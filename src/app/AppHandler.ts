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
  User,
} from '../user_profile/UserProfile';
import { AppUserSession, kInvalidAppUserSession } from './AppUserSession';
import {
  convertToPassCryptoMode,
  PassCryptoMode,
} from '../crypto/PassCryptoProxy';
import {
  ApiLoginRequest,
  ApiLoginResponse,
  ApiGetUserRequest,
  ApiGetUserResponse,
  ApiGetUsersResponse,
  ApiCreateUserRequest,
  ApiCreateUserResponse,
  ApiDeleteUserRequest,
  ApiDeleteUserResponse,
} from '../api/Api';

export class AppHandler {
  private resource: ResourceProvider;

  constructor(resource: ResourceProvider) {
    this.resource = resource;
  }

  async login(
    session: AppUserSession,
    { username, crypto, generated }: ApiLoginRequest
  ): Promise<{ response: ApiLoginResponse; session: AppUserSession }> {
    // TODO: pass ではなく、UserInputForVerify であるべき。
    // パスワード以外の何かを要求することは少ないと推測。
    // 現状のインターフェースでも影響は少なそう。
    // TODO: FIXME: easy implementation!
    const pass = (generated as any).pass ?? '';
    const userInputForVerify = {
      username,
      pass,
    };
    // TODO: move to ApiSerializer
    const crypto2 = convertToPassCryptoMode(crypto);
    if (crypto2 === null) {
      return { response: kResultInvalid, session: { ...session } };
    }

    // Use standard user manager
    const res1 = await this.resource
      .getUserManager()
      .testUser(username, crypto2, userInputForVerify);
    if (res1.ok === true) {
      return {
        response: { ok: true },
        session: { username: res1.username, level: res1.level },
      };
    }
    // Use privileged user manager
    const res2 = await this.resource
      .getPrivilegedUserManager()
      .testUser(username, crypto2, userInputForVerify);
    if (res2.ok === true) {
      return {
        response: { ok: true },
        session: { username: res2.username, level: res2.level },
      };
    }
    // If it fails, return the result of the standard usermanager.
    return { response: { ...res1 }, session: { ...session } };
  }

  async loggedout(_session: AppUserSession): Promise<ResultOk | ResultErrors> {
    return { ok: true };
  }

  async getUser(
    session: AppUserSession,
    { username }: ApiGetUserRequest
  ): Promise<ApiGetUserResponse> {
    const res1 = await this.resource.getUserManager().getUser(username);
    if (!res1.ok) {
      const res2 = await this.resource
        .getPrivilegedUserManager()
        .getUser(username);
      return res2;
    }
    return res1;
  }

  async getUsers(session: AppUserSession): Promise<ApiGetUsersResponse> {
    const res1 = await this.resource.getUserManager().allUsers();
    if (res1.ok === false) {
      return res1;
    }
    const res2 = await this.resource.getPrivilegedUserManager().allUsers();
    if (res2.ok === false) {
      return res2;
    }
    return {
      ok: true,
      data: res1.data.concat(res2.data).map((e) => ({
        username: e.username,
        level: e.level,
        me: e.username === session.username,
      })),
    };
  }

  async createUser(
    session: AppUserSession,
    { username, level, crypto, generated }: ApiCreateUserRequest
  ): Promise<ApiCreateUserResponse> {
    if (!isEditableAuthLevel(session.level, level)) {
      return kResultForbidden;
    }
    // TODO: move to ApiSerializer
    const crypto2 = convertToPassCryptoMode(crypto);
    if (crypto2 === null) {
      return kResultInvalid;
    }
    // TODO: FIXME: easy implementation!
    const pass = (generated as any).pass ?? '';

    // Avoid keeping the same username in both usermanagers.
    const res0 = await this.resource
      .getPrivilegedUserManager()
      .getUser(username);
    if (res0.ok) {
      return kResultInvalid;
    }
    // Create a user into the standard usermanager.
    const res1 = await this.resource
      .getUserManager()
      .addUser({ username, level }, crypto2, { username, pass });
    if (res1.ok === false) {
      return res1;
    }
    return {
      ok: true,
      username,
      level,
      crypto,
      generated: res1.result as object,
    };
  }

  async deleteUser(
    session: AppUserSession,
    { username }: ApiDeleteUserRequest
  ): Promise<ApiDeleteUserResponse> {
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
