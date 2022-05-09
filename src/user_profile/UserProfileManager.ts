import { ResultOk, ResultErrors, ResultInvalid } from '../base/error';
import { PassCryptoMode } from '../crypto/PassCrypto';
import { User } from './UserProfile';

//

// ### purpose
// - ユーザ情報を与えられたストレージへ保存・取得する
// - secretを外部に出さない
// - 鍵の照合を行う

//

export interface UserProfileManager {
  // TODO: Modify return type
  /**
   * Create a new user.
   * @param {User} user
   */
  addUser(
    user: User,
    passCryptoMode: PassCryptoMode,
    // TODO: 理想は、型があること
    // 型をつけようとすると、PassCryptoの型は自分で決められないため、genericが必要になる。
    // sessionDataForGenerate: object,
    // clientDataForGenerate: object,
    userInputForGenerate: object
  ): Promise<(ResultOk & { result: object }) | ResultErrors>;

  /**
   * Get a user from username
   * @param {string} username
   * @return {Promise<(ResultOk & User) | ResultErrors>}
   */
  getUser(username: string): Promise<(ResultOk & User) | ResultErrors>;

  // TODO: pagination
  /**
   * Get all users
   * @return {Promise<(ResultOk & { data: Array<User> }) | ResultErrors>}
   */
  allUsers(): Promise<(ResultOk & { data: Array<User> }) | ResultErrors>;

  /**
   * Authorize a user
   * @param {string} username
   * @param {string} pass
   * @return {} 成功以外は常に ResultInvalid を返す
   */
  testUser(
    username: string,
    passCryptoMode: PassCryptoMode,
    // TODO: 理想は、型があること
    // 型をつけようとすると、PassCryptoの型は自分で決められないため、genericが必要になる。
    // sessionDataForVerify: object,
    // clientDataForVerify: object,
    userInputForVerify: object
  ): Promise<(ResultOk & User) | ResultInvalid>;

  /**
   * Delete a user
   * @param {string} user
   * @return {}
   */
  deleteUser(username: string): Promise<ResultOk | ResultErrors>;
}
