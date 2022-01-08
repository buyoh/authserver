import { AppConfig, importAppConfigFromEnv } from './AppConfig';
import { AppExpress } from './AppExpress';
import { AppHandler } from './AppHandler';
import { OtpAuthCrypto } from './crypto/OtpAuthCrypto';
import { ResourceProvider as ResourceManager } from './ResourceProvider';
import { createMongoStorage } from './storage/StorageBuilder';
import { AuthLevelAdmin } from './user_profile/UserProfile';
import { UserProfileManager } from './user_profile/UserProfileManager';

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
  userProfileManager: UserProfileManager;
  constructor(userProfileManager: UserProfileManager) {
    this.userProfileManager = userProfileManager;
  }
  getUserManager(): UserProfileManager {
    return this.userProfileManager;
  }
}

async function createResourceManagerAppImpl(
  config: AppConfig
): Promise<ResourceManagerAppImpl> {
  // TODO: separeate Storage and Crypto, UserProfileManagers

  const passStorage = await createMongoStorage('authserver', 'user');
  const passCrypto = new OtpAuthCrypto();
  const userManager = new UserProfileManager(passStorage, passCrypto);
  // const passStorage = new VolatileStorage();
  // passStorage.initialize();
  // const userManager = new UserProfileManager(passStorage);

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
      const config = importAppConfigFromEnv();

      const resource = await createResourceManagerAppImpl(config);
      const handler = new AppHandler(resource);
      const express = new AppExpress(handler);
      express.initialize();
      express.listen(config.port);
    })();
  }
}
