import * as Express from 'express';
import * as ExpressSession from 'express-session';
import { AppHandler } from './AppHandler';
import { kResultInvalid, ResultErrors } from '../base/error';
import { convertToAuthLevel } from '../user_profile/UserProfile';
import { isLoggedIn, validateAppUserSession } from './AppUserSession';
import {
  WebContentsServerDevImpl,
  WebContentsServerImpl,
} from './WebContentsServer';
import { AppConfig } from './AppConfig';
import { convertToPassCryptoMode } from '../crypto/PassCryptoProxy';

//

// ### purpose
// - Express の制御
// - ハンドラにロジックは書かない。受け取った文字のパースや
//   返す値の選択のみを記述する

//

const sessionConfig = {
  secret: AppConfig.sessionSecret,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // expires: Date,
    // `secure: false` is safe because it requires https but the requests receive through nginx.
    secure: false,
    httpOnly: false,
    path: '/',
    // NOTE: domain must have one or more '.'. e.g., 'localhost' doesn't work.
    domain: AppConfig.domain,
  },
  resave: false,
  saveUninitialized: true,
};

//

function handleUnauthorized(res: Express.Response<any>) {
  res.status(401); // unauthorized
  res.json({ ok: false });
}

function handleGenericError(
  req: Express.Request<any>,
  res: Express.Response<any>,
  error: ResultErrors
) {
  const data = { ok: false, detail: error.detail };
  if (error.result === 'forbidden') {
    res.status(403);
    res.json(data);
  } else if (error.result === 'invalid') {
    res.status(400);
    res.json(data);
  } else if (error.result === 'notfound') {
    res.status(404);
    res.json(data);
  } else if (error.result === 'error') {
    res.status(503);
    res.json(data);
  } else {
    handleInternalError(req, res, error);
  }
}

function handleInternalError(
  req: Express.Request<any>,
  res: Express.Response<any>,
  error: any
) {
  console.error(req.method, req.originalUrl, error);
  res.status(500);
  res.json({ ok: false });
}

//

export class AppExpress {
  private appHandler: AppHandler;
  private expressApp: any;

  constructor(appHandler: AppHandler) {
    this.appHandler = appHandler;
    this.expressApp = null;
  }

  initialize(): void {
    const app = Express();
    this.expressApp = app;

    if (app.get('env') === 'production') {
      app.set('trust proxy', 1);
      sessionConfig.cookie.secure = true;
    }

    app.use(ExpressSession(sessionConfig));
    app.use(Express.urlencoded({ extended: true }));

    if (app.get('env') !== 'production') {
      app.use((req, res, next) => {
        if (req.hostname === 'localhost') {
          console.warn('hostname === "localhost": Cookies might not work!');
        }
        console.log(req.method, req.originalUrl);
        next();
      });
    }

    app.get('/auth', (req, res) => {
      // check the session.
      // bodyless response
      const session = validateAppUserSession(req.session);
      if (isLoggedIn(session)) {
        res.status(204); // no content
        res.send();
      } else {
        handleUnauthorized(res);
      }
    });

    // --------------------------

    app.post('/auth-portal/api/login', (req, res) => {
      const username = req.body.username;
      const pass = req.body.pass;
      const crypto = convertToPassCryptoMode(req.body.crypto);
      if (
        typeof username != 'string' ||
        typeof pass != 'string' ||
        crypto === null
      ) {
        handleGenericError(req, res, kResultInvalid);
        return;
      }
      const prevSession = validateAppUserSession(req.session);

      this.appHandler
        .login(prevSession, username, pass, crypto)
        .then((res1) => {
          if (res1.ok === false) {
            handleGenericError(req, res, res1);
            return;
          }
          req.session.regenerate((_err) => {
            Object.assign(req.session, res1.session);
            res.status(204); // no content
            res.send();
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    //

    app.post('/auth-portal/api/logout', (req, res) => {
      const prevSession = validateAppUserSession(req.session);
      this.appHandler
        .loggedout(prevSession)
        .then((res1) => {
          // There is no reason for canceling destroying sessions
          // if (res1.ok === false);
          req.session.destroy((_err) => {
            res.status(204); // no content
            res.send();
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    // --------------------------

    app.get('/auth-portal/api/me', (req, res) => {
      const session = validateAppUserSession(req.session);
      if (!isLoggedIn(session)) {
        handleUnauthorized(res);
      } else {
        res.status(200);
        const { username, level } = session;
        res.json({ ok: true, username, level });
      }
    });

    //

    app.get('/auth-portal/api/user/:username', (req, res) => {
      const { username } = req.params;
      const session = validateAppUserSession(req.session);
      if (!isLoggedIn(session)) {
        handleUnauthorized(res);
        return;
      }
      if (typeof username != 'string') {
        handleGenericError(req, res, kResultInvalid);
        return;
      }
      this.appHandler
        .getUser(session, username)
        .then((res1) => {
          if (res1.ok === false) {
            handleGenericError(req, res, res1);
            return;
          }
          res.status(200);
          res.json({
            ok: true,
            data: { username: res1.username, level: res1.level },
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    //

    app.get('/auth-portal/api/user', (req, res) => {
      const session = validateAppUserSession(req.session);
      if (!isLoggedIn(session)) {
        handleUnauthorized(res);
        return;
      }
      this.appHandler
        .getUsers(session)
        .then((res1) => {
          if (res1.ok === false) {
            handleGenericError(req, res, res1);
            return;
          }
          res.status(200);
          res.json({
            ok: true,
            data: res1.data.map((e) => ({
              level: e.level,
              username: e.username,
              me: e.me,
            })),
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    //

    app.post('/auth-portal/api/user', (req, res) => {
      const session = validateAppUserSession(req.session);
      if (!isLoggedIn(session)) {
        handleUnauthorized(res);
        return;
      }
      const username = req.body.username;
      const level = convertToAuthLevel(parseInt(req.body.level));
      const crypto = convertToPassCryptoMode(req.body.crypto);
      const pass = typeof req.body.pass != 'string' ? '' : req.body.pass;
      if (typeof username != 'string' || level === null || crypto === null) {
        handleGenericError(req, res, kResultInvalid);
        return;
      }
      this.appHandler
        .createUser(session, username, crypto, pass, level)
        .then((res1) => {
          if (res1.ok === false) {
            handleGenericError(req, res, res1);
            return;
          }
          res.status(200);
          res.json({
            ok: true,
            data: {
              username,
              level,
              crypto: res1.crypto,
              result: res1.result,
            },
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    //

    app.delete('/auth-portal/api/user/:username', (req, res) => {
      const { username } = req.params;
      const session = validateAppUserSession(req.session);
      if (!isLoggedIn(session)) {
        handleUnauthorized(res);
        return;
      }
      if (typeof username != 'string') {
        handleGenericError(req, res, kResultInvalid);
        return;
      }
      this.appHandler
        .deleteUser(session, username)
        .then((res1) => {
          if (res1.ok === false) {
            handleGenericError(req, res, res1);
            return;
          }
          res.status(204);
          res.send();
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    // --------------------------

    const webContentsServer =
      AppConfig.frontend === 'webpack'
        ? new WebContentsServerDevImpl()
        : new WebContentsServerImpl();

    webContentsServer.middlewares().forEach((m) => app.use(m));
    app.get('/auth-portal/?*', (req, res, next) => {
      const session = validateAppUserSession(req.session);
      if (isLoggedIn(session)) {
        webContentsServer.responseLoggedIn(req, res, next);
      } else {
        webContentsServer.responseNonLoggedIn(req, res, next);
      }
    });
  }

  listen(port: string): void {
    this.expressApp.listen(port, () => {
      console.log('listen: ', port);
    });
  }
}
