import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
}

// Update Request Type Definition to include an optional property 'currentUser'
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    
    // Check if User is logged In
    if (!req.session?.jwt) {
        console.log('JWT does not exist or has expired!');
        return next();
    }

    // Decode the JWT Token
    try{
        const jwtPayload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
        req.currentUser = jwtPayload;
    } catch (err) {
        console.log('Error encountered while verifying the JWT!', err);
    }

    next();
};