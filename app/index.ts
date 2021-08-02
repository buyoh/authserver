import * as Express from 'express';
import * as ExpressSession from 'express-session';
import * as MongoStorage from './storage/MongoStorage';
import {
  AuthLevel,
  AuthLevelFull,
  UserProfileManager,
} from './user_profile/UserProfileManager';
// import { VolatileStorage } from './storage/VolatileStorage';

const app = Express();

const sessionConfig = {
  secret: 'everythings_are_omochi',
  cookie: {
    maxAge: 60 * 60 * 24 * 7,
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

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

app.use(ExpressSession(sessionConfig));
app.use(Express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

let userManager = null as UserProfileManager | null;

// --------------------------

function loggedIn(session: any): boolean {
  return session && (session as any).username;
}

async function initializeUserManager(): Promise<void> {
  await MongoStorage.connect();
  try {
    await MongoStorage.createCollection('authserver', 'user');
  } catch (e) {
    console.warn('Collection already exists?');
    // Collection already exists
  }

  const passStorage = await new MongoStorage.MongoStorage('authserver', 'user');
  await passStorage.initialize();
  userManager = new UserProfileManager(passStorage);

  // const passStorage = new VolatileStorage();
  // passStorage.initialize();
  // userManager = new UserProfileManager(passStorage);
}

// --------------------------

(async () => {
  await initializeUserManager();

  if (!userManager) {
    console.error('runtime error: initialize database');
    process.exit(2);
  }

  if (process.env.ADMIN_USERNAME) {
    const admin_username = process.env.ADMIN_USERNAME as string;
    const otpurl = await userManager.addUser({
      username: admin_username,
      level: AuthLevelFull,
    });
    if (otpurl === null) {
      console.log('already exists: ', admin_username);
    } else {
      console.log('user', admin_username, 'pass:', otpurl);
    }
  }
})();

// --------------------------

app.get('/auth', (req, res) => {
  // check the session.
  // bodyless response
  if (loggedIn(req.session)) {
    res.status(204); // no content
    res.json({ ok: true });
  } else {
    res.status(403); // for bidden
    res.json({ ok: false });
  }
});

// --------------------------

app.get('/auth-portal/login', (req, res) => {
  if (loggedIn(req.session)) {
    res.sendFile(__dirname + '/html/loggedin.html');
  } else {
    res.sendFile(__dirname + '/html/login.html');
  }
});

app.get('/auth-portal', (req, res) => {
  // check the session.
  if (loggedIn(req.session)) {
    res.status(200);
    res.json({ ok: true });
  } else {
    res.status(403); // for bidden
    res.json({ ok: false });
  }
});

// --------------------------

// TODO: change URL
app.post('/auth-portal/login', (req, res) => {
  const username = req.body.user;
  const otppass = req.body.pass;
  if (!userManager) {
    res.status(500);
    res.json({ ok: false });
    return false;
  }
  if (!username || !otppass) {
    res.status(403);
    res.json({ ok: false });
    return false;
  }
  (async () => {
    const user = await userManager.testUser(username, otppass);
    if (user && user.username === username) {
      req.session.regenerate((err) => {
        (req.session as any).username = username;
        (req.session as any).level = user.level;
        res.redirect('/auth-portal/login'); // GET /auth-portal/login
      });
    } else {
      res.redirect('/auth-portal/login'); // GET /auth-portal/login
    }
  })();
});

app.post('/auth-portal/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/auth-portal/login'); // GET /auth-portal/logout
  });
});

// --------------------------

app.get('/auth-portal/user', (req, res) => {
  if (!loggedIn(req.session)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  res.status(200);
  res.json({ ok: false });
  // TODO: return users;
  // TODO: ...or returm self;
});

app.post('/auth-portal/user', (req, res) => {
  if (!loggedIn(req.session)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  // TODO: separate this logic to other file
  const reqUsername = req.body.username;
  const reqLevel = req.body.level - 0;
  if (!((req.session as any).level < reqLevel)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  userManager
    .addUser({ username: reqUsername, level: reqLevel as AuthLevel }) // TODO: validate
    .then((res1) => {
      if (!res1) {
        res.status(400);
        res.json({ ok: false });
        return;
      }
      res.status(200);
      res.json({
        ok: true,
        data: {
          username: reqUsername,
          level: reqLevel,
          otpauth: res1,
        },
      });
    });
});

app.delete('/auth-portal/user', (req, res) => {
  if (!loggedIn(req.session)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  // TODO: delete user
  res.status(204);
  res.json({ ok: false });
});

// --------------------------

app.listen('8888', () => {
  console.log('listen...');
});
