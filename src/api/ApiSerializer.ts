import { ResultErrors, validateResult } from '../base/error';
import { AuthLevel, validateAuthLevel } from '../user_profile/UserProfile';

function safeJSONparse(text: string): [boolean, object] {
  try {
    const o = JSON.parse(text);
    if (typeof o !== 'object') return [false, new Error('It is not object')];
    return [true, o];
  } catch (e) {
    return [false, e];
  }
}

function checkType(
  o: object,
  types: { name: string; typeName: string }[]
): boolean {
  for (let value of types) {
    if (typeof o[value.name] != value.typeName) {
      console.warn(
        'checkType failed: key=',
        value.name,
        'expectedTypeName=',
        value.typeName,
        'actualTypename=',
        typeof o[value.name]
      );
      return false;
    }
  }
  return true;
}

// AppExpress - WebApi の接合に当たるもの
// HTTPリクエストのvalidationに使う。

interface ApiSerializer<Request, Response> {
  serializeRequest(request: Request): string;
  deserializeRequest(requestRaw: string): Request | null;
  serializeResponse(response: Response): string;
  deserializeResponse(responseRaw: string): Response | null;
}

//
// POST /login
export const ApiSerializerLogin: ApiSerializer<
  { username: string; crypto: string; generated: object },
  ResultErrors | { ok: true }
> = {
  serializeRequest: function ({ username, crypto, generated }) {
    return JSON.stringify({
      username,
      crypto,
      generated: JSON.stringify(generated),
    });
  },

  deserializeRequest: function (requestRaw: string): {
    username: string;
    crypto: string;
    generated: object;
  } {
    const [jr1, json] = safeJSONparse(requestRaw);
    if (!jr1) {
      console.warn('deserializeRequest failed:', json);
      return null;
    }
    if (
      !checkType(json, [
        { name: 'username', typeName: 'string' },
        { name: 'crypto', typeName: 'string' },
        { name: 'generated', typeName: 'string' },
      ])
    ) {
      console.warn('deserializeRequest failed due to checkType');
      return null;
    }
    const username = json['username'];
    const crypto = json['crypto'];
    const generatedRaw = json['generated'];

    const [jr2, generated] = safeJSONparse(generatedRaw);
    if (!jr2) {
      console.warn('deserializeRequest failed(generated):', json);
      return null;
    }
    return { username, crypto, generated };
  },

  serializeResponse: function (response: ResultErrors | { ok: true }): string {
    return JSON.stringify(response);
  },

  deserializeResponse: function (
    responseRaw: string
  ): ResultErrors | { ok: true } {
    const [jr1, mayResponse] = safeJSONparse(responseRaw);
    if (!jr1) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }
    const response = validateResult(mayResponse);
    if (!response) {
      console.warn('deserializeResponse failed: invalid result');
      return null;
    }

    return response;
  },
};

//
// POST /logout
export const ApiSerializerLogout: ApiSerializer<{}, {}> = {
  serializeRequest: function (request: {}): string {
    return '';
  },
  deserializeRequest: function (requestRaw: string): {} {
    return {};
  },
  serializeResponse: function (response: {}): string {
    return ''; // no contents
  },
  deserializeResponse: function (responseRaw: string): {} {
    return {};
  },
};

//
// GET /me
export const ApiSerializerGetMe: ApiSerializer<
  {},
  ResultErrors | { ok: true; username: string; level: AuthLevel }
> = {
  serializeRequest: function (request: {}): string {
    return '';
  },

  deserializeRequest: function (requestRaw: string): {} {
    return {};
  },

  serializeResponse: function (
    response: ResultErrors | { ok: true; username: string; level: AuthLevel }
  ): string {
    return JSON.stringify(response);
  },

  deserializeResponse: function (
    responseRaw: string
  ): ResultErrors | { ok: true; username: string; level: AuthLevel } {
    const [jr1, mayResponse] = safeJSONparse(responseRaw);
    if (!jr1) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }
    const response = validateResult(mayResponse);
    if (!response) {
      console.warn('deserializeResponse failed: invalid result');
      return null;
    }

    if (response.ok === false) {
      return response; // Invalid case
    }

    if (
      !checkType(response, [
        { name: 'username', typeName: 'string' },
        { name: 'level', typeName: 'number' },
      ])
    ) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }

    const username = response['username'] as string;
    const level = validateAuthLevel(response['level']);

    if (level === undefined) {
      console.warn('deserializeResponse failed: level is invalid number');
      return null;
    }

    return { ok: true, username, level };
  },
};

//
// GET /user/:username
export const ApiSerializerGetUser: ApiSerializer<
  { username: string },
  ResultErrors | { ok: true; username: string; level: AuthLevel }
> = {
  serializeRequest: function ({ username }): string {
    return JSON.stringify({ username });
  },

  deserializeRequest: function (requestRaw: string): { username: string } {
    const [jr1, request] = safeJSONparse(requestRaw);
    if (!jr1) {
      console.warn('deserializeRequest failed:', request);
      return null;
    }
    if (!checkType(request, [{ name: 'username', typeName: 'string' }])) {
      console.warn('deserializeRequest failed due to checkType');
      return null;
    }
    const username = request['username'];

    return { username };
  },

  serializeResponse: function (
    response: ResultErrors | { ok: true; username: string; level: AuthLevel }
  ): string {
    return JSON.stringify(response);
  },

  deserializeResponse: function (
    responseRaw: string
  ): ResultErrors | { ok: true; username: string; level: AuthLevel } {
    const [jr1, mayResponse] = safeJSONparse(responseRaw);
    if (!jr1) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }
    const response = validateResult(mayResponse);
    if (!response) {
      console.warn('deserializeResponse failed: invalid result');
      return null;
    }

    if (response.ok === false) {
      return response; // Invalid case
    }

    if (
      !checkType(response, [
        { name: 'username', typeName: 'string' },
        { name: 'level', typeName: 'number' },
      ])
    ) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }

    const username = response['username'] as string;
    const level = validateAuthLevel(response['level']);

    if (level === undefined) {
      console.warn('deserializeResponse failed: level is invalid number');
      return null;
    }

    return { ok: true, username, level };
  },
};

//
// GET /user/
export const ApiSerializerGetUsers: ApiSerializer<
  {},
  | ResultErrors
  | { ok: true; data: { username: string; level: AuthLevel; me: boolean }[] }
> = {
  serializeRequest: function (request: {}): string {
    return '';
  },
  deserializeRequest: function (requestRaw: string): {} {
    return {};
  },
  serializeResponse: function (
    response:
      | ResultErrors
      | {
          ok: true;
          data: { username: string; level: AuthLevel; me: boolean }[];
        }
  ): string {
    return JSON.stringify(response);
  },
  deserializeResponse: function (responseRaw: string):
    | ResultErrors
    | {
        ok: true;
        data: { username: string; level: AuthLevel; me: boolean }[];
      } {
    const [jr1, mayResponse] = safeJSONparse(responseRaw);
    if (!jr1) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }
    const response = validateResult(mayResponse);
    if (!response) {
      console.warn('deserializeResponse failed: invalid result');
      return null;
    }

    if (response.ok === false) {
      return response; // Invalid case
    }

    if (!checkType(response, [{ name: 'data', typeName: 'array' }])) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }
    const mayData = response['data'] as object[];

    const badEntry = mayData.find(
      (entry) =>
        !checkType(entry, [
          { name: 'username', typeName: 'string' },
          { name: 'level', typeName: 'number' },
          { name: 'me', typeName: 'boolean' },
        ]) || !validateAuthLevel(entry['level'])
    );

    if (badEntry) {
      console.warn(
        'deserializeResponse failed due to checkType data:',
        mayResponse
      );
      return null;
    }

    const data = (
      mayData as { username: string; level: string; me: boolean }[]
    ).map(({ username, level, me }) => ({
      username,
      level: validateAuthLevel(level),
      me,
    }));
    return { ok: true, data };
  },
};

//
// POST /user/
export const ApiSerializerCreateUser: ApiSerializer<
  { username: string; level: AuthLevel; crypto: string; generated: object },
  | ResultErrors
  | {
      ok: true;
      username: string;
      level: AuthLevel;
      crypto: string;
      generated: object;
    }
> = {
  serializeRequest: function ({ username, level, crypto, generated }): string {
    return JSON.stringify({ username, level, crypto, generated });
  },

  deserializeRequest: function (requestRaw: string): {
    username: string;
    level: AuthLevel;
    crypto: string;
    generated: object;
  } {
    const [jr1, request] = safeJSONparse(requestRaw);
    if (!jr1) {
      console.warn('deserializeRequest failed:', request);
      return null;
    }
    if (
      !checkType(request, [
        { name: 'username', typeName: 'string' },
        { name: 'level', typeName: 'number' },
        { name: 'crypto', typeName: 'string' },
        { name: 'generated', typeName: 'string' },
      ])
    ) {
      console.warn('deserializeRequest failed due to checkType');
      return null;
    }
    const username = request['username'];
    const crypto = request['crypto'];
    const generatedRaw = request['generated'];
    const level = validateAuthLevel(request['level']);

    if (level === undefined) {
      console.warn('deserializeResponse failed: level is invalid number');
      return null;
    }

    const [jr2, generated] = safeJSONparse(generatedRaw);
    if (!jr2) {
      console.warn('deserializeRequest failed(generated):', request);
      return null;
    }

    return { username, level, crypto, generated };
  },

  serializeResponse: function (
    response:
      | ResultErrors
      | {
          ok: true;
          username: string;
          level: AuthLevel;
          crypto: string;
          generated: object;
        }
  ): string {
    return JSON.stringify(response);
  },

  deserializeResponse: function (responseRaw: string):
    | ResultErrors
    | {
        ok: true;
        username: string;
        level: AuthLevel;
        crypto: string;
        generated: object;
      } {
    const [jr1, mayResponse] = safeJSONparse(responseRaw);
    if (!jr1) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }
    const response = validateResult(mayResponse);
    if (!response) {
      console.warn('deserializeResponse failed: invalid result');
      return null;
    }

    if (response.ok === false) {
      return response; // Invalid case
    }

    if (
      !checkType(response, [
        { name: 'username', typeName: 'string' },
        { name: 'level', typeName: 'number' },
        { name: 'crypto', typeName: 'string' },
        { name: 'generated', typeName: 'string' },
      ])
    ) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }

    const username = response['username'] as string;
    const level = validateAuthLevel(response['level']);
    const crypto = response['crypto'] as string;
    const generatedRaw = response['generated'] as string;

    if (level === undefined) {
      console.warn('deserializeResponse failed: level is invalid number');
      return null;
    }

    const [jr2, generated] = safeJSONparse(generatedRaw);
    if (!jr2) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }

    return { ok: true, username, level, crypto, generated };
  },
};

//
// DELETE /user/:username
export const ApiSerializerDeleteUser: ApiSerializer<
  { username: string },
  ResultErrors | { ok: true }
> = {
  serializeRequest: function ({ username }): string {
    return JSON.stringify({ username });
  },

  deserializeRequest: function (requestRaw: string): { username: string } {
    const [jr1, request] = safeJSONparse(requestRaw);
    if (!jr1) {
      console.warn('deserializeRequest failed:', request);
      return null;
    }
    if (!checkType(request, [{ name: 'username', typeName: 'string' }])) {
      console.warn('deserializeRequest failed due to checkType');
      return null;
    }
    const username = request['username'];

    return { username };
  },

  serializeResponse: function (response: ResultErrors | { ok: true }): string {
    return JSON.stringify(response);
  },

  deserializeResponse: function (
    responseRaw: string
  ): ResultErrors | { ok: true } {
    const [jr1, mayResponse] = safeJSONparse(responseRaw);
    if (!jr1) {
      console.warn('deserializeResponse failed:', mayResponse);
      return null;
    }
    const response = validateResult(mayResponse);
    if (!response) {
      console.warn('deserializeResponse failed: invalid result');
      return null;
    }

    return response;
  },
};
