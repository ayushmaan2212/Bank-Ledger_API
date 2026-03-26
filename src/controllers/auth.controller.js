const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');
const tokenBlackListModel = require('../models/blacklist.model');

/**
 *  - user registration controller 
 *  - POST /api/auth/register 
 */
async function registerUser(req, res) {
    const { name, email, password } = req.body; 

    const isExists = await userModel.findOne({ email });
    if(isExists) {
        return res.status(422).json({ message: 'Email already exists', status: 'fail' });
    }

    const user = new userModel({
        name,
        email,
        password
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

    await user.save();
    res.cookie('token', token);

    res.status(201).json({ 
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    });
    await emailService.sendRegistrationEmail(user.email, user.name);


}

/**
 *  - user login controller 
 *  - POST /api/auth/login 
 */
async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');
    if(!user) {
        return res.status(401).json({ message: 'Invalid email or password', status: 'fail' });
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password', status: 'fail' });  
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

    res.cookie('token', token);
    res.status(200).json({
        user: {
            id: user._id,       
            name: user.name,
            email: user.email
        },
        token
    });
}

/**
 * User logout Controller
 * POST /api/auth/logout
 */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'User logout successfull' });
    }
    res.clearCookie('token');


    await tokenBlackListModel.create({ 
        token : token
    });

    return res.status(200).json({ message: 'User logout successfull', status: 'success' });
}

module.exports = {
    registerUser,
    loginUser,
    userLogoutController
}