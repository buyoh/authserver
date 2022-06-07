import { AppHandler } from './AppHandler';
import {
  ResultOk,
  ResultErrors,
  kResultNotFound,
  kResultInvalid,
  ResultInvalid,
} from '../base/error';
import { ResourceProvider } from './ResourceProvider';
import {
  AuthLevel,
  AuthLevelAdmin,
  AuthLevelManager,
  AuthLevelMember,
  User,
} from '../user_profile/UserProfile';
import { AppUserSession, kInvalidAppUserSession } from './AppUserSession';
import { UserProfileManager } from '../user_profile/UserProfileManager';
import { PassCryptoMode } from '../crypto/PassCrypto';

//
// testdata
//

const kPrivilegedUsers = [
  {
    username: 'admin',
    level: AuthLevelAdmin,
  },
] as User[];

const kDefaultUsers = [
  {
    username: 'manager',
    level: AuthLevelManager,
  },
  {
    username: 'member',
    level: AuthLevelMember,
  },
] as User[];

//
// mocks
//

class UserProfileManagerTestImpl implements UserProfileManager {
  users: User[];
  err: ResultErrors | null;

  constructor(users: User[]) {
    // Clone array, but shallow copy.
    this.users = users.map((u) => ({ ...u }));
    this.err = null;
    this.addUser = jest.fn(this.addUser);
    this.getUser = jest.fn(this.getUser);
    this.allUsers = jest.fn(this.allUsers);
    this.testUser = jest.fn(this.testUser);
    this.deleteUser = jest.fn(this.deleteUser);
  }

  setResultErrorforTest(e: ResultErrors | null) {
    this.err = e;
  }

  async addUser(
    user: User,
    passCryptoMode: PassCryptoMode,
    userInputForGenerate: object
  ): Promise<(ResultOk & { result: object }) | ResultErrors> {
    if (this.err) return this.err;
    this.users = this.users.concat(user);
    return { ok: true, result: {} };
  }

  async getUser(username: string): Promise<ResultErrors | (ResultOk & User)> {
    if (this.err) return this.err;
    const user = this.users.find((u) => u.username == username);
    if (user) return { ok: true, ...user };
    else return kResultNotFound;
  }

  async allUsers(): Promise<ResultErrors | (ResultOk & { data: User[] })> {
    if (this.err) return this.err;
    return { ok: true, data: this.users };
  }

  async testUser(
    username: string,
    passCryptoMode: PassCryptoMode,
    userInputForVerify: object
  ): Promise<ResultInvalid | (ResultOk & User)> {
    if (this.err) {
      if (this.err.result !== 'invalid')
        throw new Error('testUser returns only ResultInvalid');
      return this.err;
    }
    // check username
    const res = await this.getUser(username);
    if (!res.ok) return kResultInvalid;
    // check password
    if ((userInputForVerify as any).pass === 'wrongpass') return kResultInvalid;
    return res;
  }

  async deleteUser(username: string): Promise<ResultOk | ResultErrors> {
    this.users = this.users.filter((u) => u.username !== username);
    return { ok: true };
  }
}

//

class ResourceProviderTestImpl implements ResourceProvider {
  userProfileManager: UserProfileManager;
  privilegedProfileManager: UserProfileManager;
  constructor() {
    this.userProfileManager = new UserProfileManagerTestImpl(kDefaultUsers);
    this.privilegedProfileManager = new UserProfileManagerTestImpl(
      kPrivilegedUsers
    );
  }
  getPrivilegedUserManager(): UserProfileManager {
    return this.privilegedProfileManager;
  }
  getUserManager(): UserProfileManager {
    return this.userProfileManager;
  }
}

//
// utils
//

function createAppUserSession(
  username: string,
  level: AuthLevel
): AppUserSession {
  return {
    username,
    level,
  };
}

//
// testcases
//

describe('AppHandler', () => {
  it('call getUsers by admin', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    const session = createAppUserSession('admin', AuthLevelAdmin);
    const res = await handler.getUsers(session);

    expect(res.ok).toBeTruthy();
    if (!res.ok) return;
    expect(res.data.length).toEqual(3);
    expect(resourceProvider.userProfileManager.allUsers).toHaveBeenCalledTimes(
      1
    );
  });

  it('call testUser, authorize admin, success', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    const session = { ...kInvalidAppUserSession };
    const request = {
      username: 'admin',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'passphrase' },
    };
    const res = await handler.login(session, request);

    expect(res.response.ok).toBeTruthy();
    if (!res.response.ok) return;
    expect(
      resourceProvider.privilegedProfileManager.testUser
    ).toHaveBeenCalledWith('admin', 'pass', {
      pass: 'passphrase',
    });
  });

  it('call testUser, authorize member, success', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    const session = { ...kInvalidAppUserSession };
    const request = {
      username: 'member',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'passphrase' },
    };
    const res = await handler.login(session, request);

    expect(res.response.ok).toBeTruthy();
    if (!res.response.ok) return;
    expect(resourceProvider.userProfileManager.testUser).toHaveBeenCalledWith(
      'member',
      'pass',
      {
        pass: 'passphrase',
      }
    );
  });

  it('call testUser, authorize admin, fail', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    const session = { ...kInvalidAppUserSession };
    const request = {
      username: 'admin',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'wrongpass' },
    };
    const res = await handler.login(session, request);

    expect(res.response.ok).toBeFalsy();
    if (res.response.ok === true) return;
    expect(res.response.result).toBeTruthy();
  });

  it('call testUser, authorize member, fail', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    const session = { ...kInvalidAppUserSession };
    const request = {
      username: 'member',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'wrongpass' },
    };
    const res = await handler.login(session, request);

    expect(res.response.ok).toBeFalsy();
    if (res.response.ok === true) return;
    expect(res.response.result).toBeTruthy();
  });

  it('call testUser, authorize unknown user, fail', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    const session = { ...kInvalidAppUserSession };
    const request = {
      username: 'xxxxxx',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'passphrase' },
    };
    const res = await handler.login(session, request);

    expect(res.response.ok).toBeFalsy();
    if (res.response.ok === true) return;
    expect(res.response.result).toBeTruthy();
  });

  it('check permission, immutable commands', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);

    async function checkForbidden(session: AppUserSession) {
      const res1 = await handler.getUser(session, { username: 'member' });
      expect(res1.ok).toBeFalsy();
      if (res1.ok === true) return;
      expect(res1.result).toBeTruthy();

      const res2 = await handler.getUsers(session);
      expect(res2.ok).toBeFalsy();
      if (res2.ok === true) return;
      expect(res2.result).toBeTruthy();
    }
    async function checkSuccessful(session: AppUserSession) {
      const res1 = await handler.getUser(session, { username: 'member' });
      expect(res1.ok).toBeTruthy();
      if (res1.ok === false) return;
      expect(res1.username).toEqual('member');
      expect(res1.level).toEqual(AuthLevelMember);

      const res2 = await handler.getUser(session, { username: 'manager' });
      expect(res2.ok).toBeTruthy();
      if (res2.ok === false) return;
      expect(res2.username).toEqual('manager');
      expect(res2.level).toEqual(AuthLevelManager);

      const res3 = await handler.getUser(session, { username: 'admin' });
      expect(res3.ok).toBeTruthy();
      if (res3.ok === false) return;
      expect(res3.username).toEqual('admin');
      expect(res3.level).toEqual(AuthLevelAdmin);

      const res4 = await handler.getUsers(session);
      expect(res4.ok).toBeTruthy();
      if (res4.ok === false) return;
      const expectedList = kPrivilegedUsers.concat(kDefaultUsers);
      const actualList = res4.data.map(({ username, level }) => ({
        username,
        level,
      }));
      expect(actualList).toEqual(expect.arrayContaining(expectedList));
      expect(expectedList).toEqual(expect.arrayContaining(actualList));

      expect([
        { username: session.username, level: session.level, me: true },
      ]).toEqual(expect.arrayContaining(res4.data.filter((u) => u.me)));
    }

    let session = { ...kInvalidAppUserSession };

    await checkForbidden(session);

    const request1 = {
      username: 'xxxxxx',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'wrongpass' },
    };
    const res1 = await handler.login(session, request1);
    expect(res1.response.ok).toBeFalsy();
    if (res1.response.ok === true) return;
    expect(res1.response.result).toBeTruthy();
    session = res1.session;

    await checkForbidden(session);

    const request2 = {
      username: 'member',
      crypto: 'pass' as PassCryptoMode,
      generated: { pass: 'passphrase' },
    };
    const res2 = await handler.login(session, request2);
    expect(res2.response.ok).toBeTruthy();
    if (res2.response.ok === false) return;
    session = res2.session;

    await checkSuccessful(session);

    // We cannot check logged out because handler.logout does not update session.
  });

  const allUsers = kPrivilegedUsers.concat(kDefaultUsers);
  for (const user1 of allUsers) {
    for (const user2 of allUsers) {
      it(
        'check permission, mutable commands, ' +
          user1.level +
          ' -> ' +
          user2.level,
        async () => {
          const resourceProvider = new ResourceProviderTestImpl();
          const handler = new AppHandler(resourceProvider);

          async function checkForbidden(
            session: AppUserSession,
            level: AuthLevel
          ) {
            const res1 = await handler.deleteUser(session, { username: 'new' });
            expect(res1.ok).toBeFalsy();
            if (res1.ok === true) return;
            expect(res1.result).toBeTruthy();

            const res2 = await handler.createUser(session, {
              username: 'new',
              level,
              crypto: 'pass',
              generated: { pass: 'passphrase' },
            });
            expect(res2.ok).toBeFalsy();
            if (res2.ok === true) return;
            expect(res2.result).toBeTruthy();

            const s2 = { ...kInvalidAppUserSession };
            const res3 = await handler.login(s2, {
              username: 'new',
              crypto: 'pass',
              generated: { pass: 'passphrase' },
            });
            expect(res3.response.ok).toBeFalsy();
            if (res3.response.ok === true) return;
            expect(res3.response.result).toBeTruthy();
          }

          async function checkSuccessful(
            session: AppUserSession,
            level: AuthLevel
          ) {
            const res1 = await handler.deleteUser(session, { username: 'new' });
            expect(res1.ok).toBeFalsy();
            if (res1.ok === true) return;
            expect(res1.result).toBeTruthy();

            const res2 = await handler.createUser(session, {
              username: 'new',
              level,
              crypto: 'pass',
              generated: { pass: 'passphrase' },
            });
            expect(res2.ok).toBeTruthy();
            if (res2.ok === false) return;
            expect(res2.username).toEqual('new');
            expect(res2.level).toEqual(level);
            expect(res2.crypto).toEqual('pass');

            const s2 = { ...kInvalidAppUserSession };
            const res3 = await handler.login(s2, {
              username: 'new',
              crypto: 'pass',
              generated: { pass: 'passphrase' },
            });
            expect(res3.response.ok).toBeTruthy();

            const res4 = await handler.deleteUser(session, { username: 'new' });
            expect(res4.ok).toBeTruthy();
          }

          let session = { ...kInvalidAppUserSession };
          const user1level = user1.level;

          const request1 = {
            username: user1.username,
            crypto: 'pass' as PassCryptoMode,
            generated: { pass: 'passphrase' },
          };
          const res1 = await handler.login(session, request1);
          expect(res1.response.ok).toBeTruthy();
          if (res1.response.ok === false) return;
          session = res1.session;

          const user2level = user2.level;

          if (
            user2level !== AuthLevelAdmin &&
            (user1level === AuthLevelAdmin || user1level < user2level)
          ) {
            await checkSuccessful(session, user2level);
          } else {
            await checkForbidden(session, user1level);
          }
        }
      );
    }
  }
});
