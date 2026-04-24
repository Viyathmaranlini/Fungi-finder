const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


// Input Validation Helper Functions
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (password.length > 128) errors.push('Password must not exceed 128 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
    return errors;
};

const validateName = (name) => {
    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters long');
    if (name.trim().length > 100) errors.push('Name must not exceed 100 characters');
    if (/[<>{}]/.test(name)) errors.push('Name contains invalid characters');
    return errors;
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};


// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        // Sanitize inputs
        name = sanitizeInput(name);
        email = sanitizeInput(email)?.toLowerCase();
        role = sanitizeInput(role);

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'All fields are required',
                errors: ['Name, email, and password are required']
            });
        }

        // Validate name
        const nameErrors = validateName(name);
        if (nameErrors.length > 0) {
            return res.status(400).json({ message: nameErrors[0], errors: nameErrors });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ 
                message: 'Please enter a valid email address',
                errors: ['Invalid email format']
            });
        }

        // Validate password strength
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ 
                message: passwordErrors[0],
                errors: passwordErrors
            });
        }

        // Validate role (only allow user and researcher during registration)
        const allowedRoles = ['user', 'researcher'];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({ 
                message: 'Invalid role selected',
                errors: ['Role must be either "user" or "researcher"']
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});


// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Sanitize email
        email = sanitizeInput(email)?.toLowerCase();

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

module.exports = router;