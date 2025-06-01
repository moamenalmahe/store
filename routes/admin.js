const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const ADMINS_FILE = path.join(__dirname, '../data/admins.json');
const SALT_ROUNDS = 10;

// Helper function to read admins file
async function readAdminsFile() {
    try {
        const data = await fs.readFile(ADMINS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { admins: [] };
        }
        throw error;
    }
}

// Helper function to write admins file
async function writeAdminsFile(data) {
    await fs.writeFile(ADMINS_FILE, JSON.stringify(data, null, 2));
}

// Get all admins
router.get('/', async (req, res) => {
    try {
        const data = await readAdminsFile();
        // Remove sensitive information before sending
        const safeAdmins = data.admins.map(admin => ({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            created_at: admin.created_at
        }));
        res.json(safeAdmins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

// Create new admin
router.post('/create', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        // Validate input
        if (!username || !password || !email || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate role
        if (role !== 'admin' && role !== 'superadmin') {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const data = await readAdminsFile();
        
        // Check if admin already exists
        if (data.admins.some(admin => admin.username === username || admin.email === email)) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new admin
        const newAdmin = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            email,
            role,
            created_at: new Date().toISOString()
        };

        data.admins.push(newAdmin);
        await writeAdminsFile(data);

        // Remove password before sending response
        const { password: _, ...safeAdmin } = newAdmin;
        res.json({ message: 'Admin created successfully', admin: safeAdmin });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Delete admin
router.post('/delete', async (req, res) => {
    try {
        const { adminId } = req.body;

        if (!adminId) {
            return res.status(400).json({ error: 'Admin ID is required' });
        }

        const data = await readAdminsFile();
        
        // Find admin to delete
        const adminIndex = data.admins.findIndex(admin => admin.id === adminId);
        
        if (adminIndex === -1) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Prevent deletion of last superadmin
        const adminToDelete = data.admins[adminIndex];
        if (adminToDelete.role === 'superadmin') {
            const superadminCount = data.admins.filter(admin => admin.role === 'superadmin').length;
            if (superadminCount <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last superadmin' });
            }
        }

        // Remove admin
        data.admins.splice(adminIndex, 1);
        await writeAdminsFile(data);

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});

module.exports = router; 