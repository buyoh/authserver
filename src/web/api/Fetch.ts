import { ResultErrors, ResultOk, validateResult } from '../../base/error';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'; // 'HEAD'

export interface FetchResultOk<T> {
  ok: true;
  result: T;
  response: Response;
}
export interface FetchResultError {
  ok: false;
  response: Response;
}

export type FetchResult<T> = FetchResultOk<T> | FetchResultError;

// TODO: private
export function myFetch(
  uri: string,
  method: HTTPMethod,
  json: object
): Promise<Response> {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  };
  const body = Object.entries(json)
    .map((kv) => kv[0] + '=' + encodeURIComponent(kv[1]))
    .join('&');
  if (method === 'GET') {
    return fetch(uri + '?' + body, { method, headers });
  }
  return fetch(uri, { method, body, headers });
}

export async function handleMyFetch(
  uri: string,
  method: HTTPMethod,
  json: object
): Promise<FetchResult<unknown>> {
  let response = null as Response;
  try {
    response = await myFetch(uri, method, json);
    const status = response.status;
    if ((200 <= status && status < 300) || (400 <= status && status < 500)) {
      if (status === 204) {
        // No contents
        return { ok: true, result: { ok: true }, response };
      }
      const json = await response.json();
      return { ok: true, result: json, response };
    } else {
      console.warn('unexpected status code: ', status, response);
      return { ok: false, response };
    }
  } catch (e) {
    // e.g. network error, cors, ...
    console.error(e, response);
    return { ok: false, response };
  }
}
