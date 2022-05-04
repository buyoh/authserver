import { ResultErrors, ResultOk } from '../base/error';
import { AuthLevel, User } from '../user_profile/UserProfile';

//
// POST /login
export type ApiLoginRequest = {
  username: string;
  crypto: string;
  generated: object;
};
export type ApiLoginResponse = ResultErrors | ResultOk;

//
// POST /logout
export type ApiLogoutRequest = {};
export type ApiLogoutResponse = {};

//
// GET /me
export type ApiGetMeRequest = {};
export type ApiGetMeResponse = ResultErrors | (ResultOk & User);

//
// GET /user/:username
export type ApiGetUserRequest = { username: string };
export type ApiGetUserResponse = ResultErrors | (ResultOk & User);

//
// GET /user
export type ApiGetUsersRequest = {};
export type ApiGetUsersResponse =
  | ResultErrors
  // is `me` needed?
  | (ResultOk & { data: (User & { me: boolean })[] });

//
// POST /user/
export type ApiCreateUserRequest = {
  username: string;
  level: AuthLevel;
  crypto: string;
  generated: object;
};
export type ApiCreateUserResponse =
  | ResultErrors
  | (ResultOk & User & { crypto: string; generated: object });

//
// DELETE /user/:username
export type ApiDeleteUserRequest = { username: string };
export type ApiDeleteUserResponse = ResultErrors | { ok: true };
