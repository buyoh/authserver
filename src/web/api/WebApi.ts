import { AuthLevel } from '../../user_profile/UserProfile';
import { FetchResult, handleMyFetch, myFetch } from './Fetch';

export namespace WebApi {
  // TODO: REFACTORING
  export function fetchLogin(username, pass, crypto) {
    return myFetch('/auth-portal/api/login', 'POST', {
      username,
      crypto,
      pass,
    });
  }

  export function fetchLogout() {
    return myFetch('/auth-portal/api/logout', 'POST', {});
  }

  // export async function fetchMe(): Promise<
  //   FetchResult<{ username: string; level: AuthLevel }>
  // > {
  //   const res = await handleMyFetch('/auth-portal/api/me', 'GET', {});
  //   if (res.ok && res.result.ok) {
  //     if (
  //       typeof res.result['username'] == 'string' &&
  //       typeof res.result['level'] == 'number'
  //     ) {
  //       const level = validateAuthLevel(res.result['level']);
  //       if (level !== undefined) {
  //         return res;
  //       }
  //     }
  //     console.log('validation failed');
  //     res.result = { ok: false, result: 'invalid' };
  //   }
  //   return res;
  // }

  export async function fetchGetAllUser(): Promise<
    FetchResult<{
      data: [{ username: string; level: AuthLevel; me: boolean }];
    }>
  > {
    const res = await handleMyFetch('/auth-portal/api/user', 'GET', {});
    if (res.ok && res.result.ok) {
      // TODO: validate
      return res;
    }
    return res;
  }

  // export async function fetchGetUser(username: string): Promise<
  //   FetchResult<{
  //     data: { username: string; level: AuthLevel; me: boolean };
  //   }>
  // > {
  //   const res = await handleMyFetch('/auth-portal/api/user/'+username, 'GET', {});
  //   if (res.ok && res.result.ok) {
  //     // TODO: validate
  //     return res;
  //   }
  //   return res;
  // }

  export async function fetchAddUser(
    username: string,
    level: AuthLevel,
    crypto: string,
    pass: string
  ): Promise<
    FetchResult<{
      data: {
        username: string;
        level: AuthLevel;
        crypto: string;
        result: any;
      };
    }>
  > {
    const res = await handleMyFetch('/auth-portal/api/user', 'POST', {
      username,
      level,
      crypto,
      pass,
    });
    if (res.ok && res.result.ok) {
      // TODO: validate
      return res;
    }
    return res;
  }

  export async function fetchDeleteUser(
    username: string
  ): Promise<FetchResult<{}>> {
    const res = await handleMyFetch(
      '/auth-portal/api/user/' + username,
      'DELETE',
      {}
    );
    if (res.ok && res.result.ok) {
      return res;
    }
    return res;
  }
}
