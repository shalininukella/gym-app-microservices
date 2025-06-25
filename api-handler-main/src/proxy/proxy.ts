import proxy from 'express-http-proxy';
import { Request } from 'express';

export function createProxy(target: string, serviceName: string, basePath: string = "") {
  return proxy(target, {
    proxyReqPathResolver: (req: Request) => {
      const strippedPath = req.url.replace(new RegExp(`^/${serviceName}`), '');
      return basePath + strippedPath;
    },
    userResDecorator: async (proxyRes, proxyResData, req) => {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${target}${req.url}`);
      return proxyResData;
    },
    proxyErrorHandler(err, res, next) {
      console.error(`[PROXY ERROR]`, err.message);
      res.status(502).json({
        success: false,
        message: `${serviceName} service is not available`,
        status: "unavailable"
      });
    }
  });
}
