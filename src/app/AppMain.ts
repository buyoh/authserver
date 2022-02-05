import { AppConfig } from './AppConfig';
import { AppExpress } from './AppExpress';
import { AppHandler } from './AppHandler';
import { ResourceProvider as ResourceManager } from './ResourceProvider';
import { createStorage } from '../storage/StorageBuilder';
import { AuthLevelAdmin } from '../user_profile/UserProfile';
import { UserProfileManager } from '../user_profile/UserProfileManager';
import { UserProfileManagerImpl } from '../user_profile/UserProfileManagerImpl';
import { PassCryptoProxy } from '../crypto/PassCryptoProxy';

//

// ### purpose
// - 初期化やリソースの管理

//

async function createAdminUser(
  userManager: UserProfileManager,
  adminUserName: string
): Promise<void> {
  // TODO: need abstruct client crypto implementations.
  const res1 = await userManager.addUser(
    {
      username: adminUserName,
      level: AuthLevelAdmin,
    },
    { username: adminUserName }
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

  const passStorage = await createStorage(
    AppConfig.storageType,
    'authserver',
    'user',
    storageOptions
  );

  const passCrypto = new PassCryptoProxy('otpauth');
  const userManager = new UserProfileManagerImpl(passStorage, passCrypto);
  // const passStorage = new VolatileStorage();
  // passStorage.initialize();
  // const userManager = new UserProfileManagerImpl(passStorage);

  await createAdminUser(userManager, AppConfig.adminUsername);
  return new ResourceManagerAppImpl(userManager);
}

//

export class AppMain {
  constructor() {
    //
  }
  start(): void {
    (async () => {
      const resource = await createResourceManagerAppImpl();
      const handler = new AppHandler(resource);
      const express = new AppExpress(handler);
      express.initialize();
      express.listen(AppConfig.port);
    })();
  }
}
