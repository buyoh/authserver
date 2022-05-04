import {
  ApiLoginResponse,
  ApiGetUsersResponse,
  ApiCreateUserResponse,
  ApiDeleteUserResponse,
} from '../../api/Api';
import {
  ApiSerializerCreateUser,
  ApiSerializerDeleteUser,
  ApiSerializerGetUsers,
  ApiSerializerLogin,
} from '../../api/ApiSerializer';
import { PassCryptoMode } from '../../crypto/PassCrypto';
import { AuthLevel } from '../../user_profile/UserProfile';
import { FetchResult, handleMyFetch, myFetch } from './Fetch';

export namespace WebApi {
  export async function fetchLogin(
    username,
    generated,
    crypto
  ): Promise<FetchResult<ApiLoginResponse>> {
    const serialized = ApiSerializerLogin.serializeRequest({
      username,
      crypto,
      generated,
    });
    const res = await handleMyFetch(
      '/auth-portal/api/login',
      'POST',
      serialized
    );
    if (res.ok === false) {
      // network error
      return res;
    }
    const validated = ApiSerializerLogin.deserializeResponse(res.result as any);
    if (!validated) {
      // validation error
      return { ok: false, response: res.response };
    }
    return { ok: true, result: validated, response: res.response };
  }

  export function fetchLogout() {
    // TODO: REFACTORING
    return myFetch('/auth-portal/api/logout', 'POST', {});
  }

  // export async function fetchMe(): Promise<
  //   FetchResult<{ username: string; level: AuthLevel }>
  // > {
  //   const res = await handleMyFetch('/auth-portal/api/me', 'GET', {});
  //   // TODO:
  //   return res;
  // }

  export async function fetchGetAllUser(): Promise<
    FetchResult<ApiGetUsersResponse>
  > {
    const res = await handleMyFetch('/auth-portal/api/user', 'GET', {});
    if (res.ok === false) {
      // network error
      return res;
    }
    const validated = ApiSerializerGetUsers.deserializeResponse(
      res.result as any
    );
    if (!validated) {
      // validation error
      return { ok: false, response: res.response };
    }
    return { ok: true, result: validated, response: res.response };
  }

  // export async function fetchGetUser(username: string): Promise<
  //   FetchResult<{
  //     data: { username: string; level: AuthLevel; me: boolean };
  //   }>
  // > {
  //   const res = await handleMyFetch('/auth-portal/api/user/'+username, 'GET', {});
  //   // TODO:
  //   return res;
  // }

  export async function fetchAddUser(
    username: string,
    level: AuthLevel,
    crypto: PassCryptoMode,
    generated: object
  ): Promise<FetchResult<ApiCreateUserResponse>> {
    const res = await handleMyFetch(
      '/auth-portal/api/user',
      'POST',
      ApiSerializerCreateUser.serializeRequest({
        username,
        level,
        crypto,
        generated,
      })
    );
    if (res.ok === false) {
      // network error
      return res;
    }
    const validated = ApiSerializerCreateUser.deserializeResponse(
      res.result as any
    );
    if (!validated) {
      // validation error
      return { ok: false, response: res.response };
    }
    return { ok: true, result: validated, response: res.response };
  }

  export async function fetchDeleteUser(
    username: string
  ): Promise<FetchResult<ApiDeleteUserResponse>> {
    const res = await handleMyFetch(
      '/auth-portal/api/user/' + username,
      'DELETE',
      {}
    );
    if (res.ok === false) {
      // network error
      return res;
    }
    const validated = ApiSerializerDeleteUser.deserializeResponse(
      res.result as any
    );
    if (!validated) {
      // validation error
      return { ok: false, response: res.response };
    }
    return { ok: true, result: validated, response: res.response };
  }
}
