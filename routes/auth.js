const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { validateEmail, validatePassword, validateUsername } = require('../utils/validation');

const JWT_SECRET = 'your-secret-key-here';
const SALT_ROUNDS = 10;

// File paths
const USERS_FILE = path.join(__dirname, '../data/users.json');
const ADMINS_FILE = path.join(__dirname, '../data/admins.json');

// Helper function to read JSON files
async function readJsonFile(filePath) {
    try {
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Create file with initial structure if it doesn't exist
                const initialData = filePath.includes('users.json') ? { users: [] } : { admins: [] };
                await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
                return initialData;
            }
            throw error;
        }

        const data = await fs.readFile(filePath, 'utf8');
        try {
            return JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON file:', parseError);
            // If file is corrupted, create new with initial structure
            const initialData = filePath.includes('users.json') ? { users: [] } : { admins: [] };
            await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
            return initialData;
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw new Error('Failed to read user data');
    }
}

// Helper function to write JSON files
async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        throw new Error('Failed to save user data');
    }
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const errors = {};

        // Validate all fields and collect all errors
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            errors.username = usernameValidation.error;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            errors.email = emailValidation.error;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.password = {
                message: passwordValidation.error,
                requirements: passwordValidation.requirements
            };
        }

        // If there are any validation errors, return them all at once
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Check for existing users
        const [userData, adminData] = await Promise.all([
            readJsonFile(USERS_FILE),
            readJsonFile(ADMINS_FILE)
        ]);

        const existingErrors = {};

        // Check username uniqueness
        if (userData.users.some(user => user.username === username) || 
            adminData.admins.some(admin => admin.username === username)) {
            existingErrors.username = 'This username is already taken. Please choose another one.';
        }

        // Check email uniqueness
        if (userData.users.some(user => user.email === email) || 
            adminData.admins.some(admin => admin.email === email)) {
            existingErrors.email = 'This email is already registered. Please use another email or try logging in.';
        }

        // If there are any existence errors, return them
        if (Object.keys(existingErrors).length > 0) {
            return res.status(400).json({
                error: 'Registration failed',
                details: existingErrors
            });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            email,
            role: 'user',
            created_at: new Date().toISOString()
        };

        // Save user
        userData.users.push(newUser);
        await writeJsonFile(USERS_FILE, userData);

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log success
        console.log('Registration successful:', { username, email, role: 'user' });

        // Return success response
        res.cookie('token', token, { httpOnly: true });
        res.json({
            message: 'Registration successful! You can now log in.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const errors = {};

        // Basic input validation
        if (!username) {
            errors.username = 'Username is required';
        }
        if (!password) {
            errors.password = 'Password is required';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Login failed',
                details: errors
            });
        }

        // Read user data
        const [userData, adminData] = await Promise.all([
            readJsonFile(USERS_FILE),
            readJsonFile(ADMINS_FILE)
        ]);

        // Find user
        let user = userData.users.find(u => u.username === username);
        if (!user) {
            user = adminData.admins.find(a => a.username === username);
        }

        // Check user existence and password
        if (!user) {
            return res.status(401).json({
                error: 'Login failed',
                details: {
                    message: 'Invalid username or password',
                    hint: 'Please check your username and try again. If you don\'t have an account, you can register.'
                }
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Login failed',
                details: {
                    message: 'Invalid username or password',
                    hint: 'Please check your password and try again. Passwords are case-sensitive.'
                }
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log success
        console.log('Login successful:', { username, role: user.role });

        // Return success response
        res.cookie('token', token, { httpOnly: true });
        res.json({
            message: 'Login successful! Welcome back.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
});

module.exports = router; 