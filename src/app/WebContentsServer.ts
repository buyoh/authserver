import * as Path from 'path';
import * as Express from 'express';
import * as WebpackDevMiddleware from 'webpack-dev-middleware';
import * as WebpackHotMiddleware from 'webpack-hot-middleware';
import * as webpackConfig from '../../webpack.config.js';
import * as webpack from 'webpack';

const webDirName = Path.resolve(__dirname + '/../web');

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
    // TODO: remove symbolic link
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
