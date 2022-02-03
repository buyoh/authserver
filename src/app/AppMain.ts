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

class ResourceManagerAppImpl implements ResourceManager {
  UserProfileManagerImpl: UserProfileManagerImpl;
  constructor(UserProfileManagerImpl: UserProfileManagerImpl) {
    this.UserProfileManagerImpl = UserProfileManagerImpl;
  }
  getUserManager(): UserProfileManager {
    return this.UserProfileManagerImpl;
  }
}

async function createResourceManagerAppImpl(
  config: AppConfig
): Promise<ResourceManagerAppImpl> {
  // TODO: separeate Storage and Crypto, UserProfileManagerImpls

  const storageOptions = {
    mongodbDomain: config.mongodbDomain,
  };

  const passStorage = await createStorage(
    config.storageType,
    'authserver',
    'user',
    storageOptions
  );

  const passCrypto = new PassCryptoProxy('otpauth');
  const userManager = new UserProfileManagerImpl(passStorage, passCrypto);
  // const passStorage = new VolatileStorage();
  // passStorage.initialize();
  // const userManager = new UserProfileManagerImpl(passStorage);

  await createAdminUser(userManager, config.adminUsername);
  return new ResourceManagerAppImpl(userManager);
}

//

export class AppMain {
  constructor() {
    //
  }
  start(): void {
    (async () => {
      const config = AppConfig;

      const resource = await createResourceManagerAppImpl(config);
      const handler = new AppHandler(resource);
      const express = new AppExpress(handler);
      express.initialize();
      express.listen(config.port);
    })();
  }
}
