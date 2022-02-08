// ### purpose
// - よく表現したくなるエラーの定義

export interface ResultOk {
  ok: true;
}

interface ResultNg {
  ok: false;
  detail?: string;
}

export type ResultNotFound = ResultNg & { result: 'notfound' };
export type ResultForbidden = ResultNg & { result: 'forbidden' };
export type ResultInvalid = ResultNg & { result: 'invalid' };
export type ResultInternalError = ResultNg & { result: 'error' };
// TODO: investigate nice impl
export const kResultNotFound: ResultNotFound = {
  ok: false,
  result: 'notfound',
};
export const kResultForbidden: ResultForbidden = {
  ok: false,
  result: 'forbidden',
};
export const kResultInvalid: ResultInvalid = { ok: false, result: 'invalid' };
export const kResultInternalError: ResultInternalError = {
  ok: false,
  result: 'error',
};

export type Result =
  | ResultOk
  | ResultNotFound
  | ResultForbidden
  | ResultInvalid;
export type ResultErrors =
  | ResultNotFound
  | ResultForbidden
  | ResultInvalid
  | ResultInternalError;
