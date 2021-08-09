import * as Express from 'express';
import * as ExpressSession from 'express-session';
import { AppHandler } from './AppHandler';
import { kResultInvalid, ResultErrors } from './base/error';
import { convertToAuthLevel } from './user_profile/UserProfile';
import { UserSession } from './user_profile/UserSession';

//

// ### purpose
// - Express の制御
// - ハンドラにロジックは書かない。受け取った文字のパースや
//   返す値の選択のみを記述する

//

const sessionConfig = {
  secret: 'everythings_are_omochi',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // expires: Date,
    // `secure: false` is safe because it requires https but the requests receive through nginx.
    secure: false,
    httpOnly: false,
    path: '/',
    // NOTE: domain must have one or more '.'. e.g., 'localhost' doesn't work.
    domain: 'app.localhost',
  },
  resave: false,
  saveUninitialized: true,
};

//

function extractUserSession(a: any): UserSession {
  return new UserSession(a);
}

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
        console.log(req.method, req.originalUrl);
        next();
      });
    }

    app.get('/auth', (req, res) => {
      // check the session.
      // bodyless response
      const session = extractUserSession(req.session);
      if (session.isLoggedIn()) {
        res.status(204); // no content
        res.send();
      } else {
        handleUnauthorized(res);
      }
    });

    // --------------------------

    app.use('/auth-portal/assets', Express.static(__dirname + '/html/assets'));
    app.get('/auth-portal/', (req, res) => {
      const session = extractUserSession(req.session);
      if (session.isLoggedIn()) {
        res.sendFile(__dirname + '/html/loggedin.html');
      } else {
        res.sendFile(__dirname + '/html/login.html');
      }
    });

    // --------------------------

    app.post('/auth-portal/login', (req, res) => {
      const username = req.body.username;
      const pass = req.body.pass;
      if (typeof username != 'string' || typeof pass != 'string') {
        handleGenericError(req, res, kResultInvalid);
        return;
      }
      const session = extractUserSession(req.session);

      this.appHandler
        .login(session, username, pass)
        .then((res1) => {
          session.put(req.session);
          if (res1.ok === false) {
            handleGenericError(req, res, res1);
            return;
          }
          req.session.regenerate((_err) => {
            // session is updated by appHandler.login
            session.put(req.session);
            res.status(204); // no content
            res.send();
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    //

    app.post('/auth-portal/logout', (req, res) => {
      const session = extractUserSession(req.session);
      this.appHandler
        .logout(session)
        .then((res1) => {
          req.session.destroy((_err) => {
            res.status(204); // no content
            res.send();
            res.status(204); // no content
            res.send();
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    // --------------------------

    app.get('/auth-portal/me', (req, res) => {
      // check the session.
      const session = extractUserSession(req.session);
      if (!session.isLoggedIn()) {
        handleUnauthorized(res);
      } else {
        res.status(200);
        const { username, level } = session;
        res.json({ ok: true, username, level });
      }
    });

    //

    app.get('/auth-portal/user/:username', (req, res) => {
      const { username } = req.params;
      const session = extractUserSession(req.session);
      if (!session.isLoggedIn()) {
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

    app.get('/auth-portal/user', (req, res) => {
      const session = extractUserSession(req.session);
      if (!session.isLoggedIn()) {
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

    app.post('/auth-portal/user', (req, res) => {
      const session = extractUserSession(req.session);
      if (!session.isLoggedIn()) {
        handleUnauthorized(res);
        return;
      }
      const username = req.body.username;
      const level = convertToAuthLevel(parseInt(req.body.level));
      if (typeof username != 'string' || level === null) {
        handleGenericError(req, res, kResultInvalid);
        return;
      }
      this.appHandler
        .createUser(session, username, level)
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
              otpauth: res1.otpauth_url,
            },
          });
        })
        .catch((e) => handleInternalError(req, res, e));
    });

    //

    app.delete('/auth-portal/user/:username', (req, res) => {
      const { username } = req.params;
      const session = extractUserSession(req.session);
      if (!session.isLoggedIn()) {
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
  }

  listen(port: string): void {
    this.expressApp.listen(port, () => {
      console.log('listen: ', port);
    });
  }
}
