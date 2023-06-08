import { NextFunction, Request, RequestHandler, Response } from "express";

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.MONGO_PASS

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    cookieParser()(req, res, async () => {
      const token = req.cookies['token'];
      try {
        await jwt.verify(token, SECRET);
        next();
      } catch (error) {
        res.status(401).redirect('/login')
      }
    });
}

function loginRedirect(req: Request, res: Response, next: NextFunction) {
  cookieParser()(req, res, async () => {
    const token = req.cookies['token'];
    try {
      await jwt.verify(token, SECRET);
      res.redirect('/pages/principal')
    } catch (error) {
      next();
    }
  });
}

async function getUserType(req: Request, res: Response) {
    let userType
    await cookieParser()(req, res, async () => {
        const token = req.cookies['token'];

        try {
            const decodedToken = await jwt.verify(token, SECRET);
            userType = decodedToken.userType
        } catch (error) {
            console.log(`ERROW: ${error}`)
        }

    });
    return userType
}

module.exports = { isAuthenticated, getUserType, loginRedirect }