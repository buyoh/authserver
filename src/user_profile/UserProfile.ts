//

// ### purpose
// - ユーザデータのインターフェース定義
// - AuthLevelの定義

//

export const AuthLevelNone = 99;
export const AuthLevelMember = 21;
export const AuthLevelManager = 11;
export const AuthLevelAdmin = 1;

export type AuthLevel =
  | typeof AuthLevelAdmin
  | typeof AuthLevelManager
  | typeof AuthLevelMember
  | typeof AuthLevelNone;

export const kMaxTryCount = 3;
export const kAuthPenaltySec = 60;

//

export interface User {
  username: string;
  level: AuthLevel;
  // no secret
}

//

export function convertToAuthLevel(maybeLevel: any): null | AuthLevel {
  if (typeof maybeLevel != 'number') return;
  return [AuthLevelAdmin, AuthLevelMember, AuthLevelNone].find(
    (e) => e === maybeLevel
  ) as AuthLevel;
}

export function isEditableAuthLevel(me: AuthLevel, target: AuthLevel): boolean {
  return me === AuthLevelAdmin && target === AuthLevelAdmin
    ? true
    : target === AuthLevelAdmin
    ? false
    : me <= target;
}

//

export function isValudUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{2,20}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  // TODO: refactoring
  // crypto で対応するべきでは
  return true;
  // return 5 <= password.length && password.length <= 200;
}
