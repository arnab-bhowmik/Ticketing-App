import express from 'express';
const router = express.Router();

router.get('/api/users/signout', (req, res) => {
    res.send('Successfully Signed Out!');
});

export { router as signOutRouter };