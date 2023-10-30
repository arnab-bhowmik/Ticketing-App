import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-errors';
import { Password } from '../services/password-hashing';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
     .isEmail()
     .withMessage('Email must be valid'),
     body('password')
     .trim()
     .notEmpty()
     .withMessage('Password is mandatory!')
    ], 
    // Check for any Validation errors
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        //Check if a User exists with the provided email
        if (!existingUser) {
            throw new BadRequestError('User does not exist!');
        } else {
            console.log('User record exists!');
            // Check if User provided Password matches with stored password
            const doesPasswordsMatch = await Password.compare(existingUser.password, password);
            if (!doesPasswordsMatch) {
                throw new BadRequestError('Invalid credentials!');
            } else {
                //Generate JSON Web Token
                const userJWT = jwt.sign({
                    id: existingUser.id,
                    email: existingUser.email
                }, 
                process.env.JWT_KEY!
                );
                //Save JWT on Cookie Session Object
                req.session = {
                    jwt: userJWT
                };

                res.status(200).send(existingUser);
                console.log('Successfully Signed In the User!');
            }
        }
    }
);

export { router as signInRouter };