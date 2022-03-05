import { AppConfig } from './AppConfig';
import { AppExpress } from './AppExpress';
import { AppHandler } from './AppHandler';
import { ResourceProvider as ResourceManager } from './ResourceProvider';
import { createStorage } from '../storage/StorageBuilder';
import { AuthLevelAdmin } from '../user_profile/UserProfile';
import { UserProfileManager } from '../user_profile/UserProfileManager';
import { UserProfileManagerImpl } from '../user_profile/UserProfileManagerImpl';

//

// ### purpose
// - 初期化やリソースの管理

//

async function createAdminUser(userManager: UserProfileManager): Promise<void> {
  // TODO: need abstruct client crypto implementations.
  const adminUserName = AppConfig.adminUserName;
  const res1 = await userManager.addUser(
    {
      username: adminUserName,
      level: AuthLevelAdmin,
    },
    AppConfig.passCryptoMode,
    { username: adminUserName, pass: AppConfig.adminUserPass }
  );
  if (!res1.ok) {
    console.log('addUser failed. The user already may exists: ', adminUserName);
  } else {
    console.log('user', adminUserName, 'result:', res1.result);
  }
}

//

class ResourceManagerAppImpl implements ResourceManager {
  UserProfileManagerImpl: UserProfileManagerImpl;
  constructor(UserProfileManagerImpl: UserProfileManagerImpl) {
    this.UserProfileManagerImpl = UserProfileManagerImpl;
  }
  getUserManager(): UserProfileManager {
    return this.UserProfileManagerImpl;
  }
}

async function createResourceManagerAppImpl(): Promise<ResourceManagerAppImpl> {
  // TODO: separeate Storage and Crypto, UserProfileManagerImpls

  const storageOptions = {
    mongodbDomain: AppConfig.mongodbDomain,
  };

  const userStorage = await createStorage(
    AppConfig.storageType,
    AppConfig.storageDbName,
    'user',
    storageOptions
  );

  const userManager = new UserProfileManagerImpl(userStorage);

  await createAdminUser(userManager);
  return new ResourceManagerAppImpl(userManager);
}

//

export class AppMain {
  constructor() {
    //
  }
  start(): void {
    (async () => {
      let express = null as AppExpress | null;
      try {
        const resource = await createResourceManagerAppImpl();
        const handler = new AppHandler(resource);
        express = new AppExpress(handler);
        express.initialize();
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
      express.listen(AppConfig.port);
    })();
  }
}
