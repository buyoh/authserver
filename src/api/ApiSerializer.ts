import { ResultErrors, validateResult } from '../base/error';
import {
  convertToPassCryptoMode,
  PassCryptoMode,
} from '../crypto/PassCryptoProxy';
import { AuthLevel, validateAuthLevel } from '../user_profile/UserProfile';
import {
  ApiLoginRequest,
  ApiLoginResponse,
  ApiLogoutRequest,
  ApiLogoutResponse,
  ApiGetMeRequest,
  ApiGetMeResponse,
  ApiGetUserRequest,
  ApiGetUserResponse,
  ApiGetUsersRequest,
  ApiGetUsersResponse,
  ApiCreateUserRequest,
  ApiCreateUserResponse,
  ApiDeleteUserRequest,
  ApiDeleteUserResponse,
} from './Api';

//
// interface
//

type Serialized = { [key: string]: string };

// AppExpress - WebApi の接合に当たるもの
// HTTPリクエストのvalidationに使う。

interface ApiSerializer<Request, Response> {
  serializeRequest(request: Request): Serialized;
  deserializeRequest(requestRaw: Serialized): Request | null;
  serializeResponse(response: Response): Serialized;
  deserializeResponse(responseRaw: Serialized): Response | null;
}

//
// internal
//

function validateObject(
  rawValue: string,
  typeName: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'null',
  key?: string
): any {
  // string: special case!
  if (typeName === 'string') {
    return rawValue;
  }

  let result = undefined;
  try {
    result = JSON.parse(rawValue);
  } catch (e) {
    console.warn(
      'validateType failed: JSON.parse throw an error: key=',
      key,
      'expectedTypeName=',
      typeName,
      'rawValue=',
      rawValue,
      'error:',
      e
    );
    return null;
  }
  if (typeof result != typeName) {
    console.warn(
      'validateType failed: key=',
      key,
      'expectedTypeName=',
      typeName,
      'actualTypename=',
      typeof result
    );
    return null;
  }
  return result;
}

function validateType(
  o: Serialized,
  types: {
    name: string;
    // NOTE: array -> object
    typeName: 'string' | 'boolean' | 'number' | 'object' | 'null';
    optional?: boolean;
  }[]
): { [key: string]: any } | null {
  const gen = {} as { [key: string]: any };
  for (let { name, typeName, optional } of types) {
    if (o[name] === undefined) {
      if (optional) continue;
      console.warn(
        'validateType failed: missing value: key=',
        name,
        'expectedTypeName=',
        typeName,
        o
      );
      return null;
    }
    gen[name] = validateObject(o[name], typeName, name);
  }
  return gen;
}

function serialize(o: { [key: string]: any }): Serialized {
  const gen = {} as Serialized;
  for (let key in o) {
    const v = o[key];
    if (v === undefined) continue;
    if (typeof v === 'string') {
      gen[key] = v;
    } else {
      gen[key] = JSON.stringify(v);
    }
  }
  return gen;
}

function validateResultErrors(
  o: Serialized
): ResultErrors | { ok: true } | null {
  const validated1 = validateType(o, [{ name: 'ok', typeName: 'boolean' }]);
  if (!validated1) {
    return null;
  }
  if (validated1.ok === true) {
    return { ok: true };
  }
  const validated2 = validateType(o, [
    { name: 'result', typeName: 'string' },
    { name: 'detail', typeName: 'string', optional: true },
  ]);
  if (!validated2) {
    console.warn('validateResultErrors failed: ', o);
    return null;
  }
  return validateResult({ ...validated2, ok: false });
}

//
// implements
//

//
// POST /login
export const ApiSerializerLogin: ApiSerializer<
  ApiLoginRequest,
  ApiLoginResponse
> = {
  // TODO: crypto: string -> PassCryptoMode
  serializeRequest: function ({ username, crypto, generated }) {
    return {
      username,
      crypto,
      generated: JSON.stringify(generated),
    };
  },

  deserializeRequest: function (requestRaw: Serialized): {
    username: string;
    crypto: PassCryptoMode;
    generated: object;
  } | null {
    const request = validateType(requestRaw, [
      { name: 'username', typeName: 'string' },
      { name: 'crypto', typeName: 'string' },
      { name: 'generated', typeName: 'object' },
    ]);
    if (!request) {
      console.warn('deserializeRequest failed due to validateType');
      return null;
    }
    const username = request['username'];
    const cryptoRaw = request['crypto'];
    const generated = request['generated'];

    const crypto = convertToPassCryptoMode(cryptoRaw);
    if (crypto === null) {
      console.warn('deserializeRequest failed due to convertToPassCryptoMode');
      return null;
    }

    return { username, crypto, generated };
  },

  serializeResponse: function (
    response: ResultErrors | { ok: true }
  ): Serialized {
    return serialize(response);
  },

  deserializeResponse: function (
    responseRaw: Serialized
  ): ResultErrors | { ok: true } | null {
    return validateResultErrors(responseRaw);
  },
};

//
// POST /logout
export const ApiSerializerLogout: ApiSerializer<
  ApiLogoutRequest,
  ApiLogoutResponse
> = {
  serializeRequest: function (request: {}): Serialized {
    return {};
  },
  deserializeRequest: function (requestRaw: Serialized): {} {
    return {};
  },
  serializeResponse: function (response: {}): Serialized {
    return {}; // no contents
  },
  deserializeResponse: function (responseRaw: Serialized): {} {
    return {};
  },
};

//
// GET /me
export const ApiSerializerGetMe: ApiSerializer<
  ApiGetMeRequest,
  ApiGetMeResponse
> = {
  serializeRequest: function (request: {}): Serialized {
    return {};
  },

  deserializeRequest: function (requestRaw: Serialized): {} {
    return {};
  },

  serializeResponse: function (
    response: ResultErrors | { ok: true; username: string; level: AuthLevel }
  ): Serialized {
    return serialize(response);
  },

  deserializeResponse: function (
    responseRaw: Serialized
  ): ResultErrors | { ok: true; username: string; level: AuthLevel } | null {
    const response = validateResultErrors(responseRaw);
    if (response === null) {
      console.warn('deserializeResponse failed due to validateResultErrors');
      return null;
    }

    if (response.ok === false) {
      // return as ResultErrors
      return response;
    }

    const validated = validateType(responseRaw, [
      { name: 'username', typeName: 'string' },
      { name: 'level', typeName: 'number' },
    ]);
    if (!validated) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }

    const username = validated['username'];
    const level = validateAuthLevel(validated['level']);
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
  ApiGetUserRequest,
  ApiGetUserResponse
> = {
  serializeRequest: function ({ username }): Serialized {
    return { username };
  },

  deserializeRequest: function (
    requestRaw: Serialized
  ): { username: string } | null {
    const validated = validateType(requestRaw, [
      { name: 'username', typeName: 'string' },
    ]);
    if (!validated) {
      console.warn('deserializeRequest failed due to validateType');
      return null;
    }
    return { username: validated['username'] };
  },

  serializeResponse: function (
    response: ResultErrors | { ok: true; username: string; level: AuthLevel }
  ): Serialized {
    return serialize(response);
  },

  deserializeResponse: function (
    responseRaw: Serialized
  ): ResultErrors | { ok: true; username: string; level: AuthLevel } | null {
    const response = validateResultErrors(responseRaw);
    if (response === null) {
      console.warn('deserializeResponse failed due to validateResultErrors');
      return null;
    }

    if (response.ok === false) {
      // return as ResultErrors
      return response;
    }

    const validated = validateType(responseRaw, [
      { name: 'username', typeName: 'string' },
      { name: 'level', typeName: 'number' },
    ]);
    if (!validated) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }

    const username = validated['username'];
    const level = validateAuthLevel(validated['level']);
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
  ApiGetUsersRequest,
  ApiGetUsersResponse
> = {
  serializeRequest: function (request: {}): Serialized {
    return {};
  },
  deserializeRequest: function (requestRaw: Serialized): {} {
    return {};
  },

  serializeResponse: function (
    response:
      | ResultErrors
      | {
          ok: true;
          data: { username: string; level: AuthLevel; me: boolean }[];
        }
  ): Serialized {
    return serialize(response);
  },

  deserializeResponse: function (responseRaw: Serialized):
    | ResultErrors
    | {
        ok: true;
        data: { username: string; level: AuthLevel; me: boolean }[];
      }
    | null {
    const response = validateResultErrors(responseRaw);
    if (response === null) {
      console.warn('deserializeResponse failed due to validateResultErrors');
      return null;
    }

    if (response.ok === false) {
      // return as ResultErrors
      return response;
    }

    const validated = validateType(responseRaw, [
      { name: 'data', typeName: 'object' },
    ]);
    if (!validated) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }

    const mayData = (validated['data'] as any[]).map((entry) => {
      // entry is not `Serialized` (may have number, boolean) so we cannot use validateType
      const username = entry['username'];
      const levelN = entry['level'];
      const me = entry['me'];
      if (
        typeof username !== 'string' ||
        typeof levelN !== 'number' ||
        typeof me !== 'boolean'
      )
        return null;
      const level = validateAuthLevel(levelN);
      if (level === undefined) return null;
      return { username, level, me };
    });

    if (mayData.find((e) => e === null)) {
      console.warn('deserializeResponse failed due to check type:', validated);
      return null;
    }

    // NOTE: mayData does not have null
    return { ok: true, data: mayData as any };
  },
};

//
// POST /user/
export const ApiSerializerCreateUser: ApiSerializer<
  ApiCreateUserRequest,
  ApiCreateUserResponse
> = {
  serializeRequest: function ({
    username,
    level,
    crypto,
    generated,
  }): Serialized {
    return serialize({ username, level, crypto, generated });
  },

  deserializeRequest: function (requestRaw: Serialized): {
    username: string;
    level: AuthLevel;
    crypto: PassCryptoMode;
    generated: object;
  } | null {
    const request = validateType(requestRaw, [
      { name: 'username', typeName: 'string' },
      { name: 'level', typeName: 'number' },
      { name: 'crypto', typeName: 'string' },
      { name: 'generated', typeName: 'object' },
    ]);
    if (!request) {
      console.warn('deserializeRequest failed due to validateType');
      return null;
    }
    const username = request['username'];
    const cryptoRaw = request['crypto'];
    const generated = request['generated'];
    const level = validateAuthLevel(request['level']);
    if (level === undefined) {
      console.warn('deserializeResponse failed: level is invalid number');
      return null;
    }
    const crypto = convertToPassCryptoMode(cryptoRaw);
    if (crypto === null) {
      console.warn('deserializeRequest failed due to convertToPassCryptoMode');
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
          crypto: PassCryptoMode;
          generated: object;
        }
  ): Serialized {
    return serialize(response);
  },

  deserializeResponse: function (responseRaw: Serialized):
    | ResultErrors
    | {
        ok: true;
        username: string;
        level: AuthLevel;
        crypto: PassCryptoMode;
        generated: object;
      }
    | null {
    const response = validateResultErrors(responseRaw);
    if (response === null) {
      console.warn('deserializeResponse failed due to validateResultErrors');
      return null;
    }

    if (response.ok === false) {
      // return as ResultErrors
      return response;
    }

    const validated = validateType(responseRaw, [
      { name: 'username', typeName: 'string' },
      { name: 'level', typeName: 'number' },
      { name: 'crypto', typeName: 'string' },
      { name: 'generated', typeName: 'object' },
    ]);
    if (!validated) {
      console.warn('deserializeResponse failed due to checkType');
      return null;
    }
    console.log(validated, responseRaw);

    const username = validated['username'];
    const level = validateAuthLevel(validated['level']);
    const cryptoRaw = validated['crypto'];
    const generated = validated['generated'];

    if (level === undefined) {
      console.warn('deserializeResponse failed: level is invalid number');
      return null;
    }
    const crypto = convertToPassCryptoMode(cryptoRaw);
    if (crypto === null) {
      console.warn('deserializeRequest failed due to convertToPassCryptoMode');
      return null;
    }

    return { ok: true, username, level, crypto, generated };
  },
};

//
// DELETE /user/:username
export const ApiSerializerDeleteUser: ApiSerializer<
  ApiDeleteUserRequest,
  ApiDeleteUserResponse
> = {
  serializeRequest: function ({ username }): Serialized {
    return { username };
  },

  deserializeRequest: function (
    requestRaw: Serialized
  ): { username: string } | null {
    const validated = validateType(requestRaw, [
      { name: 'username', typeName: 'string' },
    ]);
    if (!validated) {
      console.warn('deserializeRequest failed due to validateType');
      return null;
    }
    return { username: validated['username'] };
  },

  serializeResponse: function (
    response: ResultErrors | { ok: true }
  ): Serialized {
    return serialize(response);
  },

  deserializeResponse: function (
    responseRaw: Serialized
  ): ResultErrors | { ok: true } | null {
    return validateResultErrors(responseRaw);
  },
};
