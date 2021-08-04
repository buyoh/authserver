//

// ### purpose
// - ユーザデータのインターフェース定義
// - AuthLevelの定義

//

export const AuthLevelNone = 99;
export const AuthLevelMember = 21;
export const AuthLevelAdmin = 1;

export type AuthLevel =
  | typeof AuthLevelAdmin
  | typeof AuthLevelMember
  | typeof AuthLevelNone;

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
  return me < target;
}
