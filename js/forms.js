/**
 * Forms Functionality for BOA STORE
 * Handles form validation, submission, and tab navigation for form sections
 */

document.addEventListener('DOMContentLoaded', () => {
    // Admin credentials - بيانات اعتماد المسؤول
    // Login credentials for admin access
    // بيانات تسجيل الدخول للوصول كمسؤول
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123";

    // Get all tab buttons and sections - الحصول على جميع أزرار التبويب والأقسام
    // Select all tab buttons and their corresponding content sections
    // تحديد جميع أزرار التبويب وأقسام المحتوى المقابلة لها
    const tabButtons = document.querySelectorAll('.tab-btn');
    const formSections = document.querySelectorAll('.form-section');
    
    // Add click event listeners to tab buttons - إضافة مستمعات أحداث النقر على أزرار التبويب
    // Set up tab switching functionality
    // إعداد وظيفة التبديل بين التبويبات
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Get the target tab id - الحصول على معرف التبويب المستهدف
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and sections - إزالة الفئة النشطة من جميع الأزرار والأقسام
                // Reset all tabs to inactive state
                // إعادة تعيين جميع التبويبات إلى الحالة غير النشطة
                tabButtons.forEach(btn => btn.classList.remove('active'));
                formSections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked button and corresponding section - إضافة الفئة النشطة إلى الزر الذي تم النقر عليه والقسم المقابل
                // Activate the selected tab and its content
                // تنشيط التبويب المحدد ومحتواه
                button.classList.add('active');
                document.getElementById(`${targetTab}-section`).classList.add('active');
            });
        });
    }

    // Form validation and submission handling - التحقق من صحة النموذج ومعالجة الإرسال
    // Get login and registration form elements
    // الحصول على عناصر نموذج تسجيل الدخول والتسجيل
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const contactForm = document.querySelector('.contact-form');

    // Login form handling - معالجة نموذج تسجيل الدخول
    // Set up login form submission event handler
    // إعداد معالج حدث إرسال نموذج تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values - الحصول على قيم النموذج
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation - تحقق بسيط
            // Check if required fields are filled
            // التحقق من ملء الحقول المطلوبة
            if (!username || !password) {
                showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // Check if admin credentials - التحقق من بيانات اعتماد المسؤول
            // Handle admin login specially
            // التعامل مع تسجيل دخول المسؤول بشكل خاص
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Store admin login status in sessionStorage - تخزين حالة تسجيل دخول المسؤول في تخزين الجلسة
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminUsername', username);
                
                // Redirect to admin panel - إعادة التوجيه إلى لوحة المسؤول
                window.location.href = 'admin-panel.html';
                return;
            }
            
            // Regular user login - تسجيل دخول المستخدم العادي
            console.log('Login form submitted', { username, password });
            
            // For demo purposes, store login status in sessionStorage - لأغراض العرض التوضيحي، تخزين حالة تسجيل الدخول في تخزين الجلسة
            sessionStorage.setItem('userLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            // Show success message - عرض رسالة النجاح
            showNotification('تم تسجيل الدخول بنجاح!', 'success');
            
            // Redirect to home page - إعادة التوجيه إلى الصفحة الرئيسية
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }

    // Registration form handling - معالجة نموذج التسجيل
    // Set up registration form submission event handler
    // إعداد معالج حدث إرسال نموذج التسجيل
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values - الحصول على قيم النموذج
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Simple validation - تحقق بسيط
            // Check if required fields are filled
            // التحقق من ملء الحقول المطلوبة
            if (!fullName || !email || !username || !password || !confirmPassword) {
                showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // Password confirmation check - التحقق من تأكيد كلمة المرور
            if (password !== confirmPassword) {
                showNotification('كلمات المرور غير متطابقة', 'error');
                return;
            }
            
            // Here you would normally send data to server - هنا عادة ما ترسل البيانات إلى الخادم
            console.log('Register form submitted', { 
                fullName, email, username, password 
            });
            
            // For demo purposes, store user in localStorage - لأغراض العرض التوضيحي، تخزين المستخدم في التخزين المحلي
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({
                fullName,
                email,
                username,
                password
            });
            localStorage.setItem('users', JSON.stringify(users));
            
            // Show success message - عرض رسالة النجاح
            showNotification('تم إنشاء الحساب بنجاح!', 'success');
            
            // Clear form fields - مسح حقول النموذج
            registerForm.reset();
            
            // Switch to login tab - التبديل إلى تبويب تسجيل الدخول
            if (tabButtons.length > 0) {
                tabButtons[0].click();
            }
        });
    }

    // Contact form handling - معالجة نموذج الاتصال
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Prevent default form submission - منع الإرسال الافتراضي للنموذج
            e.preventDefault();
            
            // Get form values - الحصول على قيم النموذج
            // Collect user input from form fields
            // جمع إدخال المستخدم من حقول النموذج
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value.trim();
            
            // Simple validation - تحقق بسيط
            // Check if required fields are filled
            // التحقق من ملء الحقول المطلوبة
            if (!name || !email || !message) {
                showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // Email validation - التحقق من صحة البريد الإلكتروني
            // Check if email format is valid using regex
            // التحقق من صحة تنسيق البريد الإلكتروني باستخدام التعبير النمطي
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
                return;
            }
            
            // In a real app, you would send the form data to a server here
            // في تطبيق حقيقي، سترسل بيانات النموذج إلى خادم هنا
            
            // Show loading state - إظهار حالة التحميل
            // Change button text to show processing state
            // تغيير نص الزر لإظهار حالة المعالجة
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'جاري الإرسال...';
            submitBtn.disabled = true;
            
            // Simulate server request - محاكاة طلب الخادم
            // Artificially delay response to simulate server processing
            // تأخير الاستجابة اصطناعيًا لمحاكاة معالجة الخادم
            setTimeout(() => {
                // Reset form - إعادة تعيين النموذج
                contactForm.reset();
                
                // Reset button - إعادة تعيين الزر
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Show success message - عرض رسالة النجاح
                showNotification('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.', 'success');
            }, 1500);
        });
    }
    
    // Review form handling - معالجة نموذج المراجعة
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const reviewText = document.getElementById('review-text').value.trim();
            const reviewerName = document.getElementById('reviewer-name').value.trim();
            const rating = document.querySelector('input[name="rating"]:checked');
            
            if (!reviewText || !reviewerName || !rating) {
                showNotification('يرجى ملء جميع الحقول المطلوبة وتحديد تقييم', 'error');
                return;
            }
            
            // Here you would send the review to a server
            // For demo purposes, we'll just simulate success
            
            showNotification('تم إرسال مراجعتك بنجاح', 'success');
            reviewForm.reset();
        });
    }
}); 