import * as Express from 'express';
import * as WebpackDevMiddleware from 'webpack-dev-middleware';
import * as WebpackHotMiddleware from 'webpack-hot-middleware';
import * as webpackConfig from '../../webpack.config.js';
import * as webpack from 'webpack';

interface WebContentsServer {
  middlewares: () => Array<Express.RequestHandler>;
  responseLoggedIn: Express.RequestHandler;
  responseNonLoggedIn: Express.RequestHandler;
}

export class WebContentsServerDevImpl implements WebContentsServer {
  middlewares(): Array<Express.RequestHandler> {
    // webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    const compiler = webpack(webpackConfig);
    return [
      WebpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
      }),
      WebpackHotMiddleware(compiler),
    ];
  }
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

export class WebContentsServerImpl implements WebContentsServer {
  middlewares(): Array<Express.RequestHandler> {
    return [];
  }
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
