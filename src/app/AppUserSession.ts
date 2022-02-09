import {
  AuthLevel,
  AuthLevelNone,
  convertToAuthLevel,
  isValudUsername,
} from '../user_profile/UserProfile';

//

// ### purpose
// - session 情報の型付け

//

export interface AppUserSession {
  readonly username: string | null;
  readonly level: AuthLevel;
}

export const kInvalidAppUserSession: AppUserSession = {
  username: null,
  level: AuthLevelNone,
};

export function isLoggedIn(session: AppUserSession): boolean {
  return (
    typeof session.username === 'string' &&
    session.username.length >= 1 &&
    session.level !== AuthLevelNone
  );
}

export function validateAppUserSession(a: any) {
  if (!a || a.username === undefined || a.level === undefined)
    return { ...kInvalidAppUserSession };
  const { username, level } = a;
  if (!isValudUsername(username)) return { ...kInvalidAppUserSession };
  const convertedLevel = convertToAuthLevel(level);
  if (convertedLevel === null) return { ...kInvalidAppUserSession };
  return { username, level: convertedLevel };
}
