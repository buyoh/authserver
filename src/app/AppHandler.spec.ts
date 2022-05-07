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
    // Only check username
    const res = await this.getUser(username);
    if (!res.ok) return kResultInvalid;
    return res;
  }

  async deleteUser(username: string): Promise<ResultOk | ResultErrors> {
    throw new Error('Method not implemented.');
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
    expect(resourceProvider.userProfileManager.testUser).toHaveBeenCalledTimes(
      1
    );
    expect(
      resourceProvider.privilegedProfileManager.testUser
    ).toHaveBeenCalledTimes(1);
    expect(
      resourceProvider.privilegedProfileManager.testUser
    ).toHaveBeenCalledWith('admin', 'pass', {
      pass: 'passphrase',
    });
  });
});
