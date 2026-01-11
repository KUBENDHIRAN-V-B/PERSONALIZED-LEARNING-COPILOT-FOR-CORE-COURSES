"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if user exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = new User_1.User({
            id: (0, uuid_1.v4)(),
            email,
            name,
            password: hashedPassword,
            createdAt: new Date(),
        });
        await user.save();
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }
        // Find user
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map