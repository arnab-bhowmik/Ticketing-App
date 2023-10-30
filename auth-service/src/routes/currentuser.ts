import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
    // Check if JWT exists in the Cookie session
    if (!req.session?.jwt) {
        console.log('JWT does not exist or has expired!');
        return res.send({ currentUser: null });
    } else {
        try{
            const jwtPayload = jwt.verify(req.session?.jwt, process.env.JWT_KEY!);
            res.send({ currentUser: jwtPayload });
        } catch (err) {
            console.log('Error encountered while verifying the JWT!', err);
            res.send({ currentUser: null });
        }
    }
});

export { router as currentUserRouter };