import * as Express from 'express';
import * as ExpressSession from 'express-session';
import { VolatileStorage } from './storage/VolatileStorage';
import { UserProfileManager } from './user_profile/UserProfileManager';

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

const passStorage = new VolatileStorage();
passStorage.initialize();
const userManager = new UserProfileManager(passStorage);

// TODO: for testing
// const otpurl = userManager.addUser('rootadmin');
// console.log('pass:', otpurl);

function loggedIn(session: any) {
  return session && (session as any).username;
}

// --------------------------

app.get('/auth/login', (req, res) => {
  if (loggedIn(req.session)) {
    res.sendFile(__dirname + '/html/loggedin.html');
  } else {
    res.sendFile(__dirname + '/html/login.html');
  }
});

// --------------------------

app.get('/', (req, res) => {
  // check the session.
  if (loggedIn(req.session)) {
    res.status(200);
    res.json({ ok: true });
  } else {
    res.status(403); // for bidden
    res.json({ ok: false });
  }
});

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

app.post('/auth/login', (req, res) => {
  const username = req.body.user;
  const otppass = req.body.pass;
  if (!username || !otppass) {
    res.status(403);
    res.json({ ok: false });
    return false;
  }
  if (userManager.testUser(username, otppass)) {
    req.session.regenerate((err) => {
      (req.session as any).username = username;
      res.redirect('/auth/login'); // GET /auth/login
    });
  } else {
    res.redirect('/auth/login'); // GET /auth/login
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/auth/login'); // GET /auth/logout
  });
});

// --------------------------

app.get('/auth/api/user', (req, res) => {
  if (!loggedIn(req.session)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  res.status(200);
  res.json({ ok: true });
  // TODO:
});

app.post('/auth/api/user', (req, res) => {
  if (!loggedIn(req.session)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  // TODO:
  res.status(200);
  res.json({ ok: true });
});

app.delete('/auth/api/user', (req, res) => {
  if (!loggedIn(req.session)) {
    res.status(403);
    res.json({ ok: false });
    return;
  }
  // TODO:
  res.status(204);
  res.json({ ok: true });
});

// --------------------------

app.listen('8888', () => {
  console.log('listen...');
});
