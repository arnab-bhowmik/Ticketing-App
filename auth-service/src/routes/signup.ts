import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
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
    (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).send(errors.array());
        }
        const { email, password } = req.body;

        console.log('Successfully Signed Up new User!');

        res.send({});
});

export { router as signUpRouter };