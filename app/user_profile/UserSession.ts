import {
  AuthLevel,
  AuthLevelNone,
  convertToAuthLevel,
  isValudUsername,
} from './UserProfile';

//

// ### purpose
// - session 情報の型付け

//

export class UserSession {
  username: string | null;
  level: AuthLevel;

  constructor(a: any) {
    if (!a || a.username === undefined || a.level === undefined) {
      this.setInvalid();
      return;
    }
    const { username, level } = a;
    if (!isValudUsername(username)) {
      this.setInvalid();
      return;
    }
    const convertedLevel = convertToAuthLevel(level);
    if (convertedLevel === null) {
      this.setInvalid();
      return;
    }
    this.username = username;
    this.level = convertedLevel;
  }

  static createEmpty(): UserSession {
    return new UserSession(null);
  }

  isLoggedIn(): boolean {
    return (
      this.username && this.username.length >= 1 && this.level !== AuthLevelNone
    );
  }

  put(a: any): void {
    a.username = this.username;
    a.level = this.level;
  }

  setInvalid(): void {
    this.username = null;
    this.level = AuthLevelNone;
  }
}
