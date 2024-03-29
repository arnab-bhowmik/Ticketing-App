import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/transporter';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@ticketing_org/custom-modules';

const router = express.Router();

router.post('/api/users/signup', [
        body('name')
         .notEmpty()
         .withMessage('Name must be provided'),
        body('email')
         .notEmpty()
         .isEmail()
         .withMessage('Email must be valid'),
        body('password')
         .notEmpty()
         .trim()
         .isLength({ min: 6, max: 20 })
         .withMessage('Password length must be between 6 and 20 characters')
    ], 
    // Check for any Validation errors
    validateRequest,
    async (req: Request, res: Response) => {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        // Check if any User already exists with the same email
        if (existingUser) {
            throw new BadRequestError('Email already exists!');
        } else {
            // Creat the User & save in corresponding MongoDB Collection
            const user = User.build({ name, email, password });
            await user.save();
            console.log('Successfully signed Up new User...');

            // Generate JSON Web Token
            const userJWT = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_KEY!);

            // Save JWT on Cookie Session Object
            req.session = { jwt: userJWT };

            // Send Email to new User
            sendEmail(user.email, `Welcome To TicketMart ${user.name}!`, 'Thanks for joining TicketMart, your one-stop shop for listing & buying Tickets for any and all kinds of events.');

            res.status(201).send(user);
        }
    }
);

export { router as signUpRouter };