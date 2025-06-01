/**
 * Admin Chat Functionality
 * وظائف دردشة المسؤول
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    if (typeof checkAdminStatus !== 'function' || !checkAdminStatus()) {
        return; // Exit if not admin
    }
    
    // Elements
    const chatList = document.getElementById('admin-chat-list');
    const chatMessages = document.getElementById('admin-chat-messages');
    const confirmPaymentBtn = document.getElementById('confirm-payment-admin');
    const rejectPaymentBtn = document.getElementById('reject-payment-admin');
    const sendAccountDetailsBtn = document.getElementById('send-account-details');
    const chatWithUser = document.getElementById('chat-with-user');
    const chatProductInfo = document.getElementById('chat-product-info');
    const accountEmail = document.getElementById('account-email');
    const accountPassword = document.getElementById('account-password');
    const accountUsername = document.getElementById('account-username');
    const searchChatInput = document.getElementById('search-chat');
    
    // Current chat data
    let currentChat = null;
    
    // Admin response form
    const adminMsgForm = document.getElementById('admin-message-form');
    const adminMsgInput = document.getElementById('admin-message-input');
    
    // Load chat sessions
    loadChatSessions();
    
    // Setup event listeners
    if (searchChatInput) {
        searchChatInput.addEventListener('input', filterChats);
    }
    
    if (adminMsgForm) {
        adminMsgForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageText = adminMsgInput.value.trim();
            if (messageText && currentChat) {
                // Add admin message to chat
                const message = {
                    type: 'bot',
                    text: messageText,
                    time: getCurrentTime(),
                    isAdmin: true
                };
                
                // Add to UI
                addMessageToUI(message);
                
                // Save to localStorage
                saveMessageToChat(currentChat.id, message);
                
                // Clear input
                adminMsgInput.value = '';
            }
        });
    }
    
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function() {
            if (!currentChat) return;
            
            if (!accountEmail.value.trim()) {
                alert('يرجى إدخال البريد الإلكتروني للعميل لإرسال تفاصيل الحساب');
                accountEmail.focus();
                return;
            }
            
            // Update chat status
            updateChatStatus(currentChat.id, 'confirmed');
            
            // Add system message
            const confirmMessage = 'تم تأكيد الدفع بنجاح! سيتم إرسال تفاصيل الحساب إلى بريدك الإلكتروني خلال دقائق.';
            const message = {
                type: 'system',
                text: confirmMessage,
                time: getCurrentTime()
            };
            
            addMessageToUI(message);
            saveMessageToChat(currentChat.id, message);
            
            // Update chat item in list
            updateChatItemStatus(currentChat.id, 'confirmed');
            
            // Enable send account details button
            if (sendAccountDetailsBtn) {
                sendAccountDetailsBtn.disabled = false;
            }
        });
    }
    
    if (rejectPaymentBtn) {
        rejectPaymentBtn.addEventListener('click', function() {
            if (!currentChat) return;
            
            // Update chat status
            updateChatStatus(currentChat.id, 'rejected');
            
            // Add system message
            const rejectMessage = 'عذراً، لم نتمكن من تأكيد عملية الدفع. يرجى التأكد من تحويل المبلغ الصحيح إلى الحساب الصحيح وإرسال صورة واضحة للإيصال.';
            const message = {
                type: 'system',
                text: rejectMessage,
                time: getCurrentTime()
            };
            
            addMessageToUI(message);
            saveMessageToChat(currentChat.id, message);
            
            // Update chat item in list
            updateChatItemStatus(currentChat.id, 'rejected');
            
            // Add detailed instructions
            setTimeout(() => {
                const detailedMessage = {
                    type: 'bot',
                    text: `يبدو أن هناك مشكلة في عملية الدفع. يرجى التأكد من:
                    <ul>
                        <li>تحويل المبلغ الصحيح (${currentChat?.product?.price || '199 EGP'})</li>
                        <li>التحويل إلى الحساب الصحيح</li>
                        <li>إرسال صورة واضحة لإيصال الدفع</li>
                    </ul>
                    إذا كنت تعتقد أن هناك خطأ، يرجى التواصل معنا على البريد الإلكتروني: support@boastore.com`,
                    time: getCurrentTime(),
                    isAdmin: true
                };
                
                addMessageToUI(detailedMessage);
                saveMessageToChat(currentChat.id, detailedMessage);
            }, 1000);
        });
    }
    
    if (sendAccountDetailsBtn) {
        sendAccountDetailsBtn.addEventListener('click', function() {
            if (!currentChat) return;
            
            // Generate random account details
            const email = accountEmail ? accountEmail.value : `account_${Math.floor(1000 + Math.random() * 9000)}@example.com`;
            const password = accountPassword ? accountPassword.value : generateRandomPassword();
            const username = accountUsername ? accountUsername.value : `Player_${Math.floor(10000 + Math.random() * 90000)}`;
            
            // Create account details message
            const accountMessage = `
                تفاصيل الحساب الخاص بك:
                
                البريد الإلكتروني: ${email}
                كلمة المرور: ${password}
                اسم المستخدم: ${username}
                
                يرجى تغيير كلمة المرور فور تسجيل الدخول للحفاظ على أمان الحساب.
            `;
            
            // Create message object
            const message = {
                type: 'bot',
                text: accountMessage,
                time: getCurrentTime(),
                isAdmin: true
            };
            
            // Save message to chat
            saveMessageToChat(currentChat.id, message);
            
            // Add message to UI
            addMessageToUI(message);
            
            // Disable button to prevent sending multiple times
            sendAccountDetailsBtn.disabled = true;
        });
    }
    
    // Function to load chat sessions
    function loadChatSessions() {
        if (!chatList) return;
        
        // Clear existing chats
        chatList.innerHTML = '';
        
        // Get chats from localStorage
        const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        
        if (chatSessions.length === 0) {
            chatList.innerHTML = '<div class="no-chats">لا توجد محادثات</div>';
            return;
        }
        
        // Add chats to list
        chatSessions.forEach(chat => {
            const chatItem = createChatListItem(chat);
            chatList.appendChild(chatItem);
        });
        
        // Select first chat by default
        if (chatSessions.length > 0) {
            const firstChatItem = chatList.querySelector('.chat-list-item');
            if (firstChatItem) {
                firstChatItem.click();
            }
        }
    }
    
    // Function to create chat list item
    function createChatListItem(chat) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-list-item';
        chatItem.setAttribute('data-id', chat.id);
        
        // Format date
        const chatDate = new Date(chat.date);
        const formattedDate = formatDate(chatDate);
        
        // Determine status class and text
        let statusClass = 'pending';
        let statusText = 'في الانتظار';
        
        if (chat.status === 'confirmed') {
            statusClass = 'confirmed';
            statusText = 'تم التأكيد';
        } else if (chat.status === 'rejected') {
            statusClass = 'rejected';
            statusText = 'مرفوض';
        }
        
        // Get last message for preview
        let lastMessage = 'لا توجد رسائل';
        if (chat.messages && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (lastMsg.isImage) {
                lastMessage = 'صورة';
            } else {
                // Strip HTML and truncate
                lastMessage = lastMsg.text.replace(/<[^>]*>/g, '');
                if (lastMessage.length > 40) {
                    lastMessage = lastMessage.substring(0, 40) + '...';
                }
            }
        }
        
        chatItem.innerHTML = `
            <div class="chat-list-item-header">
                <div class="chat-user">${chat.user}</div>
                <div class="chat-time">${formattedDate}</div>
            </div>
            <div class="chat-product">${chat.product?.title || 'منتج غير معروف'}</div>
            <div class="chat-preview">${lastMessage}</div>
            <div class="chat-status ${statusClass}">${statusText}</div>
        `;
        
        // Add click event to load chat details
        chatItem.addEventListener('click', () => {
            // Remove active class from all items
            document.querySelectorAll('.chat-list-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            chatItem.classList.add('active');
            
            // Load chat details
            loadChatDetails(chat);
        });
        
        return chatItem;
    }
    
    // Function to load chat details
    function loadChatDetails(chat) {
        if (!chatMessages || !chatWithUser || !chatProductInfo) return;
        
        // Store current chat
        currentChat = chat;
        
        // Clear messages
        chatMessages.innerHTML = '';
        
        // Set user info
        chatWithUser.textContent = chat.user;
        chatProductInfo.textContent = chat.product?.title || 'منتج غير معروف';
        
        // Set email if available
        if (accountEmail && chat.userEmail) {
            accountEmail.value = chat.userEmail;
        }
        
        // Load messages
        if (chat.messages && chat.messages.length > 0) {
            chat.messages.forEach(message => {
                addMessageToUI(message);
            });
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Set button states based on chat status
        if (confirmPaymentBtn && rejectPaymentBtn && sendAccountDetailsBtn) {
            if (chat.status === 'confirmed') {
                confirmPaymentBtn.disabled = true;
                rejectPaymentBtn.disabled = true;
                sendAccountDetailsBtn.disabled = false;
            } else if (chat.status === 'rejected') {
                confirmPaymentBtn.disabled = false;
                rejectPaymentBtn.disabled = true;
                sendAccountDetailsBtn.disabled = true;
            } else {
                confirmPaymentBtn.disabled = false;
                rejectPaymentBtn.disabled = false;
                sendAccountDetailsBtn.disabled = true;
            }
        }
    }
    
    // Function to add message to UI
    function addMessageToUI(message) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;
        
        if (message.isImage) {
            // Image message
            messageDiv.innerHTML = `
                <div class="message-content">
                    <img src="${message.image}" alt="Payment Receipt">
                </div>
                <div class="message-time">${message.time}</div>
            `;
        } else if (message.type === 'bot') {
            // Bot/admin message
            messageDiv.innerHTML = `
                <div class="message-content">${message.text}</div>
                <div class="message-time">${message.time}${message.isAdmin ? ' (أنت)' : ''}</div>
            `;
        } else {
            // User or system message
            messageDiv.innerHTML = `
                <div class="message-content">${message.text}</div>
                <div class="message-time">${message.time}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to update chat status
    function updateChatStatus(chatId, status) {
        const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const chatIndex = chatSessions.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            chatSessions[chatIndex].status = status;
            localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
            
            // Update current chat object
            if (currentChat && currentChat.id === chatId) {
                currentChat.status = status;
            }
        }
    }
    
    // Function to update chat item status in the list
    function updateChatItemStatus(chatId, status) {
        const chatItem = document.querySelector(`.chat-list-item[data-id="${chatId}"]`);
        if (!chatItem) return;
        
        const statusElement = chatItem.querySelector('.chat-status');
        if (!statusElement) return;
        
        statusElement.className = `chat-status ${status}`;
        
        let statusText = 'في الانتظار';
        if (status === 'confirmed') {
            statusText = 'تم التأكيد';
        } else if (status === 'rejected') {
            statusText = 'مرفوض';
        }
        
        statusElement.textContent = statusText;
    }
    
    // Function to save message to chat
    function saveMessageToChat(chatId, message) {
        const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const chatIndex = chatSessions.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            chatSessions[chatIndex].messages.push(message);
            localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
        }
    }
    
    // Function to filter chats
    function filterChats() {
        if (!searchChatInput || !chatList) return;
        
        const searchTerm = searchChatInput.value.trim().toLowerCase();
        const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        
        // Clear existing chats
        chatList.innerHTML = '';
        
        if (chatSessions.length === 0) {
            chatList.innerHTML = '<div class="no-chats">لا توجد محادثات</div>';
            return;
        }
        
        // Filter and add chats to list
        const filteredChats = chatSessions.filter(chat => {
            const userName = chat.user.toLowerCase();
            const productName = (chat.product?.title || '').toLowerCase();
            
            return userName.includes(searchTerm) || 
                   productName.includes(searchTerm) || 
                   (chat.userEmail && chat.userEmail.toLowerCase().includes(searchTerm));
        });
        
        if (filteredChats.length === 0) {
            chatList.innerHTML = '<div class="no-chats">لا توجد نتائج مطابقة</div>';
            return;
        }
        
        // Add filtered chats to list
        filteredChats.forEach(chat => {
            const chatItem = createChatListItem(chat);
            chatList.appendChild(chatItem);
        });
    }
    
    // Function to format date
    function formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (chatDate.getTime() === today.getTime()) {
            return 'اليوم ' + date.getHours().toString().padStart(2, '0') + ':' + 
                   date.getMinutes().toString().padStart(2, '0');
        } else if (chatDate.getTime() === yesterday.getTime()) {
            return 'الأمس';
        } else {
            return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        }
    }
    
    // Function to add system message
    function addSystemMessage(text) {
        if (!currentChat) return;
        
        const message = {
            type: 'system',
            text: text,
            time: getCurrentTime()
        };
        
        // Add to UI
        addMessageToUI(message);
        
        // Save to localStorage
        saveMessageToChat(currentChat.id, message);
    }
    
    // Function to get current time
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Function to generate random password
    function generateRandomPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        
        return password;
    }
}); 