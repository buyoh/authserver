import * as Express from 'express';

interface WebContentsServer {
  responseLoggedIn: Express.RequestHandler;
  responseNonLoggedIn: Express.RequestHandler;
}

export class WebContentsServerImpl implements WebContentsServer {
  responseLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    // TODO: remove symbolic link
    if (req.path.startsWith('/auth-portal/assets/')) {
      Express.static(__dirname + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(__dirname + '/auth-portal/loggedin.html');
    } else {
      next();
    }
  }
  responseNonLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path.startsWith('/auth-portal/assets/')) {
      Express.static(__dirname + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(__dirname + '/auth-portal/login.html');
    } else {
      next();
    }
  }
}
