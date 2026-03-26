const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlackListModel = require('../models/blacklist.model');



async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided', status: 'fail' });
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token });

    if(isBlackListed) {
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted', status: 'fail' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);  
        if(!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found', status: 'fail' });
        }   
        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token', status: 'fail' });
    }

}

async function authSystemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized access: No token provided' });
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token });

    if(isBlackListed){
        return res.status(401).json({ message: 'Unauthorized access: Token is blacklisted' });
    }


    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemUser');
        if(!user.systemUser) {
            return res.status(403).json({ message: 'Forbidden access: not a system user' });
        }
        req.user = user;
        return next();

    }catch(err) {
        return res.status(401).json({ message: 'Unauthorized access: Invalid token' });
    }



}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}; 