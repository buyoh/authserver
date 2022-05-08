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

export const kManageableAuthLevelList = [
  AuthLevelManager,
  AuthLevelMember,
] as AuthLevel[];

export const kMaxTryCount = 3;
export const kAuthPenaltySec = 60;

//

export interface User {
  username: string;
  level: AuthLevel;
  // no secret
}

//

export function validateAuthLevel(maybeLevel: any): undefined | AuthLevel {
  if (typeof maybeLevel != 'number') return;
  return [
    AuthLevelAdmin as AuthLevel,
    AuthLevelManager as AuthLevel,
    AuthLevelMember as AuthLevel,
    AuthLevelNone as AuthLevel,
  ].find((e) => e === maybeLevel);
}

export function authLevelToString(level: AuthLevel): string {
  return level === AuthLevelAdmin
    ? 'admin'
    : level === AuthLevelManager
    ? 'manager'
    : level === AuthLevelMember
    ? 'member'
    : '#' + level;
}

export function isEditableAuthLevel(me: AuthLevel, target: AuthLevel): boolean {
  return me === AuthLevelAdmin && target === AuthLevelAdmin
    ? true
    : me < target;
}

//

export function isValudUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{2,20}$/.test(username);
}
