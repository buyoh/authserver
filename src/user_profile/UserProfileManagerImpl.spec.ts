import { VolatileStorage } from '../storage/VolatileStorage';
import { UserProfileManagerImpl } from './UserProfileManagerImpl';

describe('UserProfileManagerImpl', () => {
  it('fixme', async () => {
    const storage = new VolatileStorage('test');
    const man = new UserProfileManagerImpl(storage);
  });
});
