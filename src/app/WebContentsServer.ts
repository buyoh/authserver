import Path from 'path';
import Express from 'express';
// TODO: move to devDependencies (maybe impossible)
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
//@ts-ignore
import * as webpackConfig from '../../webpack.config.js';
import webpack from 'webpack';

const webDirName = Path.resolve(__dirname + '/../web');

interface WebContentsServer {
  middlewares: () => Array<Express.RequestHandler>;
  responseLoggedIn: Express.RequestHandler;
  responseNonLoggedIn: Express.RequestHandler;
}

export class WebContentsServerDevImpl implements WebContentsServer {
  middlewares(): Array<Express.RequestHandler> {
    const compiler = webpack(webpackConfig as any);
    return [
      WebpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
      }),
      // WebpackHotMiddleware(compiler),  // TODO:
    ];
  }
  responseLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path.startsWith('/auth-portal/assets/')) {
      Express.static(webDirName + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/auth-portal/loggedin.html');
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
      Express.static(webDirName + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/auth-portal/login.html');
    } else {
      next();
    }
  }
}

export class WebContentsServerImpl implements WebContentsServer {
  middlewares(): Array<Express.RequestHandler> {
    return [];
  }
  responseLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path.startsWith('/auth-portal/module/')) {
      Express.static(webDirName + '/')(req, res, next);
    } else if (req.path.startsWith('/auth-portal/assets/')) {
      Express.static(webDirName + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/auth-portal/loggedin.html');
    } else {
      next();
    }
  }
  responseNonLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path.startsWith('/auth-portal/module/')) {
      Express.static(webDirName + '/')(req, res, next);
    } else if (req.path.startsWith('/auth-portal/assets/')) {
      Express.static(webDirName + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/auth-portal/login.html');
    } else {
      next();
    }
  }
}
