import Path from 'path';
import Express from 'express';
// TODO: move to devDependencies (maybe impossible)
import WebpackDevMiddleware, { OutputFileSystem } from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
//@ts-ignore
import * as webpackConfig from '../../webpack.config.js';
import webpack from 'webpack';

const webDirName = Path.resolve(__dirname + '/../web');
const bundleDirName = Path.resolve(__dirname + '/../../bundle');

interface WebContentsServer {
  middlewares: () => Array<Express.RequestHandler>;
  responseLoggedIn: Express.RequestHandler;
  responseNonLoggedIn: Express.RequestHandler;
}

export class WebContentsServerDevImpl implements WebContentsServer {
  middlewares(): Array<Express.RequestHandler> {
    const compiler = webpack(webpackConfig.default);

    // 以下のように、diskに書き出すこともできる。
    // ただし、hot-middleの一次ファイルが大量に出来るのでおすすめしない
    // const outputFileSystem = Fs as OutputFileSystem;
    // outputFileSystem.join = Path.join;
    // (outputFileSystem as any).mkdirp = () => {
    //   // mkdirp is not needed, maybe
    //   throw Error('outputFileSystem.mkdirp is not implemented');
    // };

    return [
      WebpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        // outputFileSystem,  // use memfs
      }),
      WebpackHotMiddleware(compiler as any), // TODO:
    ];
  }
  responseLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/html/loggedin.html');
    } else {
      next();
    }
  }
  responseNonLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/html/login.html');
    } else {
      next();
    }
  }
}

export class WebContentsServerImpl implements WebContentsServer {
  constructor() {
    // TODO: Check that the user have run `yarn build`
  }
  middlewares(): Array<Express.RequestHandler> {
    return [];
  }
  responseLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    if (req.path.startsWith('/auth-portal/bundle/')) {
      Express.static(bundleDirName + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/html/loggedin.html');
    } else {
      next();
    }
  }
  responseNonLoggedIn(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): void {
    // TODO: fix visibility
    if (req.path.startsWith('/auth-portal/bundle/')) {
      Express.static(bundleDirName + '/')(req, res, next);
    } else if (req.path === '/auth-portal' || req.path === '/auth-portal/') {
      res.sendFile(webDirName + '/html/login.html');
    } else {
      next();
    }
  }
}
