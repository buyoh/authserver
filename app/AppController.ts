import { AppExpress } from './AppExpress';
import { AppHandler } from './AppHandler';
import * as MongoStorage from './storage/MongoStorage';
import { AuthLevelAdmin } from './user_profile/UserProfile';
import { UserProfileManager } from './user_profile/UserProfileManager';

//

// ### purpose
// - 初期化やリソースの管理

//

async function initializeUserManager(): Promise<UserProfileManager> {
  //
  await MongoStorage.connect();
  try {
    await MongoStorage.createCollection('authserver', 'user');
  } catch (e) {
    console.warn('Collection already exists?');
    // Collection already exists
  }

  const passStorage = await new MongoStorage.MongoStorage('authserver', 'user');
  await passStorage.initialize();
  return new UserProfileManager(passStorage);

  // const passStorage = new VolatileStorage();
  // passStorage.initialize();
  // this.userManager = new UserProfileManager(passStorage);
}

async function createAdminUser(
  userManager: UserProfileManager,
  adminUserName: string
): Promise<void> {
  // const admin_username = process.env.ADMIN_USERNAME as string;
  const res1 = await userManager.addUser({
    username: adminUserName,
    level: AuthLevelAdmin,
  });
  if (!res1.ok) {
    console.log('already exists: ', adminUserName);
  } else {
    console.log('user', adminUserName, 'pass:', res1.otpauth_url);
  }
}

//

export interface AppControllerResourceProvider {
  getUserManager(): UserProfileManager;
}

class AppControllerResourceProviderImpl
  implements AppControllerResourceProvider
{
  userManager: () => UserProfileManager;
  constructor(userManager: () => UserProfileManager) {
    this.userManager = userManager;
  }
  getUserManager(): UserProfileManager {
    return this.userManager();
  }
}

//

export class AppController {
  constructor() {
    //
  }
  start(): void {
    (async () => {
      const adminUsername = process.env.ADMIN_USERNAME as string;
      const port = (process.env.PORT as string) || '8888';
      if (!adminUsername) {
        console.error('env.ADMIN_USERNAME is empty');
        process.exit(2);
      }

      const userManager = await initializeUserManager();
      await createAdminUser(userManager, adminUsername);
      const resource = new AppControllerResourceProviderImpl(() => userManager);
      const handler = new AppHandler(resource);
      const express = new AppExpress(handler);
      express.initialize();
      express.listen(port);
    })();
  }
}
