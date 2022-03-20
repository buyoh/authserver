import { AppConfig } from './AppConfig';
import { AppExpress } from './AppExpress';
import { AppHandler } from './AppHandler';
import { ResourceProvider } from './ResourceProvider'; // TODO: FIX
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

class ResourceProviderAppImpl implements ResourceProvider {
  userProfileManagerImpl: UserProfileManagerImpl;
  privilegedUserProfileManagerImpl: UserProfileManagerImpl;
  constructor(
    userProfileManagerImpl: UserProfileManagerImpl,
    privilegedUserProfileManagerImpl: UserProfileManagerImpl
  ) {
    this.userProfileManagerImpl = userProfileManagerImpl;
    this.privilegedUserProfileManagerImpl = privilegedUserProfileManagerImpl;
  }
  getUserManager(): UserProfileManager {
    return this.userProfileManagerImpl;
  }
  getPrivilegedUserManager(): UserProfileManager {
    return this.privilegedUserProfileManagerImpl;
  }
}

async function createResourceProviderAppImpl(): Promise<ResourceProviderAppImpl> {
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

  const privilegedUserStorage = await createStorage(
    'memory',
    AppConfig.storageDbName,
    'puser',
    {}
  );

  const userManager = new UserProfileManagerImpl(userStorage);
  const privilegedUserManager = new UserProfileManagerImpl(
    privilegedUserStorage
  );

  if ((await userManager.getUser(AppConfig.adminUserName)).ok) {
    throw new Error(
      `The admin username "${AppConfig.adminUserName}" already exists! Aborting!`
    );
  }
  await createAdminUser(privilegedUserManager);

  return new ResourceProviderAppImpl(userManager, privilegedUserManager);
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
        const resource = await createResourceProviderAppImpl();
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
