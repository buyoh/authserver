import { UserProfileManager } from '../user_profile/UserProfileManager';

export interface ResourceProvider {
  getUserManager(): UserProfileManager;
  // used only for admin user.
  getPrivilegedUserManager(): UserProfileManager;
}
