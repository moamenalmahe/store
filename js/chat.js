/**
 * Chat Functionality
 * وظائف الدردشة
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load product information from session storage - تحميل معلومات المنتج من تخزين الجلسة
    const productInfo = JSON.parse(sessionStorage.getItem('purchaseProduct') || '{}');
    const productTitle = document.getElementById('product-title');
    const productPrice = document.getElementById('product-price');
    const productImage = document.getElementById('product-image');
    const productNameChat = document.getElementById('product-name-chat');
    const productPriceChat = document.getElementById('product-price-chat');
    
    // Set product information if available - تعيين معلومات المنتج إذا كانت متوفرة
    if (productInfo.title) {
        productTitle.textContent = productInfo.title;
        productPrice.textContent = productInfo.price;
        productImage.src = productInfo.image;
        
        // Set product info in chat message
        if (productNameChat) productNameChat.textContent = productInfo.title;
        if (productPriceChat) productPriceChat.textContent = productInfo.price;
        
        // Display seller information if available
        const sellerInfo = document.getElementById('seller-info');
        const sellerName = document.getElementById('seller-name');
        if (sellerInfo && sellerName && productInfo.seller) {
            sellerName.textContent = productInfo.seller;
            sellerInfo.style.display = 'block';
        } else if (sellerInfo) {
            sellerInfo.style.display = 'none';
        }
    }
    
    // Check admin status - التحقق من حالة المسؤول
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const adminTools = document.getElementById('admin-tools');
    
    // Show/hide admin tools based on status - إظهار/إخفاء أدوات المسؤول بناءً على الحالة
    if (adminLoggedIn) {
        adminTools.style.display = 'block';
        console.log('Admin tools enabled');
    } else {
        adminTools.style.display = 'none';
        console.log('Admin tools disabled - user is not an admin');
    }
    
    // Initialize chat - تهيئة الدردشة
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    
    // Check if a chat session exists or create a new one - التحقق من وجود جلسة دردشة أو إنشاء واحدة جديدة
    const chatId = sessionStorage.getItem('currentChatId') || 'chat_' + Date.now();
    sessionStorage.setItem('currentChatId', chatId);
    
    // Load existing chat session if available - تحميل جلسة الدردشة الحالية إذا كانت متوفرة
    loadChatSession(chatId);
    
    // Handle chat form submission - معالجة إرسال نموذج الدردشة
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageText = messageInput.value.trim();
            if (messageText) {
                // Add user message - إضافة رسالة المستخدم
                addMessage(messageText, 'user');
                
                // Save the message to chat session - حفظ الرسالة في جلسة الدردشة
                saveMessage({
                    type: 'user',
                    text: messageText,
                    time: getCurrentTime()
                });
                
                // Clear input - مسح الإدخال
                messageInput.value = '';
                
                // Simulate seller response for demo purposes - محاكاة استجابة البائع لأغراض العرض التوضيحي
                setTimeout(() => {
                    // Only respond to certain keywords - الاستجابة فقط لكلمات مفتاحية معينة
                    const botResponse = getBotResponse(messageText);
                    if (botResponse) {
                        addMessage(botResponse, 'bot');
                        saveMessage({
                            type: 'bot',
                            text: botResponse,
                            time: getCurrentTime()
                        });
                    }
                }, 1000);
            }
        });
    }
    
    // Handle file upload - معالجة تحميل الملف
    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    
    if (fileUpload) {
        fileUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileName.textContent = file.name;
                
                // Check if file is an image - التحقق مما إذا كان الملف صورة
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imageUrl = e.target.result;
                        
                        // Add image message - إضافة رسالة صورة
                        addImageMessage(imageUrl);
                        
                        // Save the image message to chat session - حفظ رسالة الصورة في جلسة الدردشة
                        saveMessage({
                            type: 'user',
                            isImage: true,
                            image: imageUrl,
                            time: getCurrentTime()
                        });
                        
                        // Add system message about receipt upload - إضافة رسالة نظام حول تحميل الإيصال
                        setTimeout(() => {
                            const systemMessage = 'تم استلام إيصال الدفع الخاص بك. سيتم مراجعته والرد عليك في أقرب وقت. ستتلقى تفاصيل الحساب عبر البريد الإلكتروني المسجل بعد تأكيد الدفع.';
                            addMessage(systemMessage, 'system');
                            
                            saveMessage({
                                type: 'system',
                                text: systemMessage,
                                time: getCurrentTime()
                            });
                            
                            // Update status indicator - تحديث مؤشر الحالة
                            const statusIndicator = document.querySelector('.status-indicator');
                            if (statusIndicator) {
                                statusIndicator.className = 'status-indicator pending';
                                statusIndicator.innerHTML = '<span class="status-dot"></span> في انتظار التأكيد';
                            }
                            
                            // Simulate seller response for receipt - محاكاة استجابة البائع للإيصال
                            setTimeout(() => {
                                const sellerResponse = 'شكراً لإرسال إيصال الدفع. سنقوم بمراجعته والرد عليك في أقرب وقت ممكن.';
                                addMessage(sellerResponse, 'bot');
                                saveMessage({
                                    type: 'bot',
                                    text: sellerResponse,
                                    time: getCurrentTime()
                                });
                            }, 2000);
                        }, 1000);
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                // Reset file input - إعادة تعيين إدخال الملف
                setTimeout(() => {
                    fileName.textContent = '';
                    this.value = '';
                }, 3000);
            }
        });
    }
    
    // Function to load chat session - وظيفة لتحميل جلسة الدردشة
    function loadChatSession(chatId) {
        const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const chatSession = chatSessions.find(chat => chat.id === chatId);
        
        if (chatSession) {
            // Display previous messages - عرض الرسائل السابقة
            chatSession.messages.forEach(message => {
                if (message.isImage) {
                    addImageMessage(message.image);
                } else {
                    addMessage(message.text, message.type);
                }
            });
            
            // Update status indicator based on chat status - تحديث مؤشر الحالة بناءً على حالة الدردشة
            const statusIndicator = document.querySelector('.status-indicator');
            if (statusIndicator) {
                if (chatSession.status === 'confirmed') {
                    statusIndicator.className = 'status-indicator confirmed';
                    statusIndicator.innerHTML = '<span class="status-dot"></span> تم تأكيد الدفع';
                    
                    // Show confirmation message - عرض رسالة التأكيد
                    const confirmationMessage = document.getElementById('confirmation-message');
                    if (confirmationMessage) {
                        confirmationMessage.classList.add('active');
                    }
                } else if (chatSession.status === 'rejected') {
                    statusIndicator.className = 'status-indicator rejected';
                    statusIndicator.innerHTML = '<span class="status-dot"></span> تم رفض الدفع';
                    
                    // Show rejection message - عرض رسالة الرفض
                    const rejectionMessage = document.getElementById('rejection-message');
                    if (rejectionMessage) {
                        rejectionMessage.classList.add('active');
                    }
                }
            }
        } else {
            // Create new chat session if none exists - إنشاء جلسة دردشة جديدة إذا لم تكن موجودة
            const username = sessionStorage.getItem('username') || 'زائر' + Math.floor(Math.random() * 1000);
            
            const newChat = {
                id: chatId,
                user: username,
                userEmail: document.getElementById('user-email')?.value || '',
                product: productInfo,
                status: 'pending',
                date: new Date().toISOString(),
                messages: [
                    {
                        type: 'system',
                        text: 'مرحبًا بك في خدمة الشراء من BOA STORE. يرجى إتمام عملية الدفع باستخدام إحدى طرق الدفع المتاحة وإرسال إيصال الدفع.',
                        time: getCurrentTime()
                    },
                    {
                        type: 'system',
                        text: `تفاصيل الدفع للمنتج: ${productInfo.title || 'المنتج'}<br><br>يرجى تحويل مبلغ <strong>${productInfo.price || '199 EGP'}</strong> إلى أحد الحسابات التالية:<ul><li>فودافون كاش: 01XXXXXXXXX</li><li>إنستا باي: @boastore</li><li>بنك مصر: 123456789</li></ul>بعد إتمام التحويل، يرجى إرسال صورة لإيصال الدفع أدناه وسيتم تأكيد طلبك في أقرب وقت.`,
                        time: getCurrentTime()
                    }
                ]
            };
            
            // Add to chat sessions
            chatSessions.unshift(newChat);
            
            // Save to localStorage
            localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
        }
    }
    
    // Function to save message to chat session - وظيفة لحفظ الرسالة في جلسة الدردشة
    function saveMessage(message) {
        const chatId = sessionStorage.getItem('currentChatId');
        const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const chatIndex = chatSessions.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            // Add message to existing chat - إضافة الرسالة إلى الدردشة الموجودة
            chatSessions[chatIndex].messages.push(message);
        } else {
            // Create new chat with message - إنشاء دردشة جديدة مع الرسالة
            const username = sessionStorage.getItem('username') || 'زائر' + Math.floor(Math.random() * 1000);
            
            const newChat = {
                id: chatId,
                user: username,
                userEmail: document.getElementById('user-email')?.value || '',
                product: productInfo,
                status: 'pending',
                date: new Date().toISOString(),
                messages: [message]
            };
            
            // Add to chat sessions
            chatSessions.unshift(newChat);
        }
        
        // Save to localStorage
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
    
    // Function to add a message to the chat - وظيفة إضافة رسالة إلى الدردشة
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="https://via.placeholder.com/40" alt="Bot">
                </div>
                <div class="message-content">${text}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${text}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to get current time - وظيفة للحصول على الوقت الحالي
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Function to get bot response based on user message - وظيفة للحصول على استجابة البوت بناءً على رسالة المستخدم
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        
        if (lowerCaseMessage.includes('دفع') || lowerCaseMessage.includes('payment') || lowerCaseMessage.includes('pay')) {
            return 'يمكنك الدفع عن طريق التحويل البنكي أو فودافون كاش أو إنستا باي. بعد الدفع، يرجى إرسال صورة إيصال الدفع هنا وسنقوم بتأكيد طلبك في أقرب وقت.';
        } else if (lowerCaseMessage.includes('توصيل') || lowerCaseMessage.includes('delivery')) {
            return 'عذراً، لا نقوم بتوصيل المنتجات حالياً. يمكنك استلام المنتج المشترى بشكل إلكتروني عن طريق البريد الإلكتروني.';
        } else if (lowerCaseMessage.includes('متوفر') || lowerCaseMessage.includes('available')) {
            return 'نعم، المنتج متوفر حالياً. يمكنك إتمام عملية الشراء بأمان.';
        } else if (lowerCaseMessage.includes('سعر') || lowerCaseMessage.includes('price')) {
            return `سعر ${productInfo.title || 'المنتج'} هو ${productInfo.price || '199 EGP'}.`;
        } else if (lowerCaseMessage.includes('مرحب') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hello')) {
            return 'مرحباً بك! كيف يمكنني مساعدتك اليوم؟';
        } else {
            return 'أنا هنا لمساعدتك. يمكنك طرح أي أسئلة أو مخاوف تتعلق بعملية الشراء وسأكون سعيداً بالرد عليها.';
        }
    }
    
    // Function to add an image message to the chat - وظيفة إضافة رسالة صورة إلى الدردشة
    function addImageMessage(imageUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <img src="${imageUrl}" alt="Payment Receipt">
            </div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Account Details Modal - نافذة تفاصيل الحساب
    const accountDetailsModal = document.getElementById('account-details-modal');
    
    // Add modal close functionality for the account details modal
    const closeModalBtn = document.querySelector('.close-modal');

    if (closeModalBtn && accountDetailsModal) {
        closeModalBtn.addEventListener('click', function() {
            accountDetailsModal.classList.remove('active');
        });
        
        // Close when clicking outside the modal
        window.addEventListener('click', function(event) {
            if (event.target === accountDetailsModal) {
                accountDetailsModal.classList.remove('active');
            }
        });
    }
}); 