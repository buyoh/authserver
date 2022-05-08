import {
  kResultForbidden,
  kResultInvalid,
  ResultErrors,
  ResultOk,
} from '../base/error';
import { ResourceProvider } from './ResourceProvider';
import {
  AuthLevelAdmin,
  isEditableAuthLevel,
} from '../user_profile/UserProfile';
import { AppUserSession, isLoggedIn } from './AppUserSession';
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
    // Use standard user manager
    const res1 = await this.resource
      .getUserManager()
      .testUser(username, crypto, generated);
    if (res1.ok === true) {
      return {
        response: { ok: true },
        session: { username: res1.username, level: res1.level },
      };
    }
    // Use privileged user manager
    const res2 = await this.resource
      .getPrivilegedUserManager()
      .testUser(username, crypto, generated);
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
    if (!isLoggedIn(session)) {
      return kResultForbidden;
    }
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
    if (!isLoggedIn(session)) {
      return kResultForbidden;
    }
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
    if (!isLoggedIn(session)) {
      return kResultForbidden;
    }
    if (level === AuthLevelAdmin) {
      return kResultForbidden;
    }
    if (!isEditableAuthLevel(session.level, level)) {
      return kResultForbidden;
    }

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
      .addUser({ username, level }, crypto, generated);
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
    if (!isLoggedIn(session)) {
      return kResultForbidden;
    }
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
