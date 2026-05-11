const express = require('express');
const User = require('../models/User');
const generateToken = require('../utils/auth');
const jwt = require('jsonwebtoken');
const { getIsUsingMock } = require('../config/db');
const { getUsers, saveUsers } = require('../utils/jsonDb');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Helper to handle authentication logic
const handleSignup = async (name, email, password) => {
    if (getIsUsingMock()) {
        const users = getUsers();
        if (users.find(u => u.email === email)) throw new Error('User already exists');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = { _id: Date.now().toString(), name, email, password: hashedPassword };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    }

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error('User already exists');
    return await User.create({ name, email, password });
};

const handleLogin = async (email, password) => {
    if (getIsUsingMock()) {
        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        throw new Error('Invalid email or password');
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        return user;
    }
    throw new Error('Invalid email or password');
};

// @desc    Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await handleSignup(name, email, password);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(error.message === 'User already exists' ? 400 : 500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await handleLogin(email, password);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// @desc    Get user profile
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        
        if (getIsUsingMock()) {
            const users = getUsers();
            const user = users.find(u => u._id === decoded.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const { password, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        }

        const user = await User.findById(decoded.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Not authorized' });
    }
});

module.exports = router;
