import { AppHandler } from './AppHandler';
import {
  ResultOk,
  ResultErrors,
  kResultNotFound,
  kResultInvalid,
} from './base/error';
import { ResourceProvider } from './ResourceProvider';
import {
  AuthLevelAdmin,
  AuthLevelMember,
  User,
} from './user_profile/UserProfile';
import { UserSession } from './user_profile/UserSession';
import { UserProfileManager } from './user_profile/UserProfileManager';

const defaultUsers = [
  {
    username: 'admin',
    level: AuthLevelAdmin,
  },
  {
    username: 'member',
    level: AuthLevelMember,
  },
] as User[];

class UserProfileManagerTestImpl implements UserProfileManager {
  users: User[];
  err: ResultErrors | null;
  constructor() {
    this.users = defaultUsers.map((u) => ({ ...u }));
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
    user: User
  ): Promise<(ResultOk & { otpauth_url: string }) | ResultErrors> {
    if (this.err) return this.err;
    this.users = this.users.concat(user);
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
    pass: string,
    incTryCount: boolean
  ): Promise<ResultErrors | (ResultOk & User)> {
    if (this.err) return this.err;
    const res = await this.getUser(username);
    if (!res.ok) return kResultInvalid;
    return res;
  }
  async deleteUser(username: string): Promise<ResultOk | ResultErrors> {
    throw new Error('Method not implemented.');
  }
}

class ResourceProviderTestImpl implements ResourceProvider {
  userProfileManager: UserProfileManager;
  constructor() {
    this.userProfileManager = new UserProfileManagerTestImpl();
    console.log(Object.keys(this.userProfileManager));
  }
  getUserManager(): UserProfileManager {
    return this.userProfileManager;
  }
}

describe('test', () => {
  it('getUsers', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);
    const session = new UserSession({
      username: 'admin',
      level: AuthLevelAdmin,
    });
    const res = await handler.getUsers(session);
    expect(res.ok).toBeTruthy();
    if (!res.ok) return;
    expect(res.data.length).toEqual(2);
    expect(resourceProvider.userProfileManager.allUsers).toHaveBeenCalledTimes(
      1
    );
  });

  it('testUser: authorize', async () => {
    const resourceProvider = new ResourceProviderTestImpl();
    const handler = new AppHandler(resourceProvider);
    const session = UserSession.createEmpty();
    const res = await handler.login(session, 'admin', 'pass');
    expect(res.ok).toBeTruthy();
    if (!res.ok) return;
    expect(resourceProvider.userProfileManager.testUser).toHaveBeenCalledTimes(
      1
    );
    expect(resourceProvider.userProfileManager.testUser).toHaveBeenCalledWith(
      'admin',
      'pass',
      true
    );
  });
});
