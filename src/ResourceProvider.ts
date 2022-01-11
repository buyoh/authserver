import { UserProfileManager } from './user_profile/UserProfileManager';

export interface ResourceProvider {
  getUserManager(): UserProfileManager;
}
