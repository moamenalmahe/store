const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const CONVERSATIONS_FILE = path.join(__dirname, '../data/conversations.json');

// Helper function to read conversations file
async function readConversationsFile() {
    try {
        const data = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { conversations: [] };
        }
        throw error;
    }
}

// Helper function to write conversations file
async function writeConversationsFile(data) {
    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
}

// Get conversations for a user
router.post('/get', async (req, res) => {
    try {
        const { conversationId } = req.body;
        const data = await readConversationsFile();

        let conversations = data.conversations;

        // If conversationId is provided, return only that conversation
        if (conversationId) {
            const conversation = conversations.find(c => c.id === conversationId);
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            // Check if user has access to this conversation
            if (!conversation.participants.includes(req.user.id) && 
                !['admin', 'superadmin'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Access denied' });
            }

            return res.json(conversation);
        }

        // Filter conversations based on user role and participation
        if (req.user.role === 'user') {
            conversations = conversations.filter(conv => 
                conv.participants.includes(req.user.id)
            );
        }
        // Admins and superadmins can see all conversations

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Send a message
router.post('/send', async (req, res) => {
    try {
        const { conversationId, message, recipientId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const data = await readConversationsFile();

        // If conversationId is provided, add message to existing conversation
        if (conversationId) {
            const conversationIndex = data.conversations.findIndex(c => c.id === conversationId);
            
            if (conversationIndex === -1) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            // Check if user has access to this conversation
            if (!data.conversations[conversationIndex].participants.includes(req.user.id) && 
                !['admin', 'superadmin'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // Add message to conversation
            const newMessage = {
                id: Date.now().toString(),
                senderId: req.user.id,
                senderName: req.user.username,
                content: message,
                timestamp: new Date().toISOString()
            };

            data.conversations[conversationIndex].messages.push(newMessage);
            await writeConversationsFile(data);

            return res.json({
                message: 'Message sent successfully',
                conversation: data.conversations[conversationIndex]
            });
        }

        // If no conversationId but recipientId is provided, create new conversation
        if (recipientId) {
            const newConversation = {
                id: Date.now().toString(),
                participants: [req.user.id, recipientId],
                created_at: new Date().toISOString(),
                messages: [{
                    id: Date.now().toString(),
                    senderId: req.user.id,
                    senderName: req.user.username,
                    content: message,
                    timestamp: new Date().toISOString()
                }]
            };

            data.conversations.push(newConversation);
            await writeConversationsFile(data);

            return res.json({
                message: 'New conversation created and message sent successfully',
                conversation: newConversation
            });
        }

        res.status(400).json({ error: 'Either conversationId or recipientId is required' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router; 