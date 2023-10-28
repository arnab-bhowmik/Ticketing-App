import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import { RequestValidationError } from '../errors/request-validation-errors';
import { BadRequestError } from '../errors/bad-request-errors';

const router = express.Router();

router.post('/api/users/signup', [
        body('email')
         .isEmail()
         .withMessage('Email must be valid'),
         body('password')
         .trim()
         .isLength({ min: 4, max: 20 })
         .withMessage('Password length must be between 4 and 20 characters')
    ], 
    async (req: Request, res: Response) => {
        // Check for any Validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array());
        }

        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        
        //Check if any User already exists with the same email
        if (existingUser) {
            throw new BadRequestError('Email already exists!');
        } else {
            // Creat the User & save in corresponding MongoDB Collection
            const user = User.build({ email, password });
            await user.save();
            res.status(201).send(user);
            console.log('Successfully signed Up new User...');
        }
});

export { router as signUpRouter };