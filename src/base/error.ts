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
  | ResultInvalid
  | ResultInternalError;
export type ResultErrors =
  | ResultNotFound
  | ResultForbidden
  | ResultInvalid
  | ResultInternalError;

function validateResultInternal(json: {
  [key: string]: unknown;
}): Result | null {
  const ok = (json as { [key: string]: unknown })['ok'];
  if (ok === true) {
    return { ...json, ok: true };
  } else if (ok === false) {
    const result = json['result'];
    const detail = json['detail'] ? `${json['detail']}` : undefined;
    if (
      result === 'notfound' ||
      result === 'forbidden' ||
      result === 'invalid' ||
      result === 'error'
    )
      return { ...json, ok: false, result: result, detail };
    return { ...json, ok: false, result: 'error', detail };
  } else {
    console.log('validateResult: invalid result data found');
    return null;
  }
}

export function validateResult(json: unknown): Result | null {
  if (!json || typeof json != 'object') {
    console.log('validateResult: invalid result data found');
    return null;
  }
  return validateResultInternal(json as { [key: string]: unknown });
}
