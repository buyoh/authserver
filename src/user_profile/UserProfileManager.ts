import { ResultOk, ResultErrors } from '../base/error';
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
    user: User
  ): Promise<(ResultOk & { otpauth_url: string }) | ResultErrors>;

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

  // TODO: 何故 incTryCount を引数として実装したか忘れた
  /**
   * Authorize a user
   * @param {string} username
   * @param {string} pass
   * @param {boolean} incTryCount 試行回数を増加させるかどうか
   * @return {}
   */
  testUser(
    username: string,
    pass: string,
    incTryCount: boolean
  ): Promise<(ResultOk & User) | ResultErrors>;

  /**
   * Delete a user
   * @param {string} user
   * @return {}
   */
  deleteUser(username: string): Promise<ResultOk | ResultErrors>;
}
