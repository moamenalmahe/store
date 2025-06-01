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

    // Form validation and submission handling - التحقق من صحة النموذج ومعالجة الإرسال
    // Get login and registration form elements
    // الحصول على عناصر نموذج تسجيل الدخول والتسجيل
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

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
                alert('الرجاء ملء جميع الحقول المطلوبة');
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
            alert('تم تسجيل الدخول بنجاح!');
            
            // Redirect to home page - إعادة التوجيه إلى الصفحة الرئيسية
            window.location.href = 'index.html';
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
                alert('الرجاء ملء جميع الحقول المطلوبة');
                return;
            }
            
            // Password confirmation check - التحقق من تأكيد كلمة المرور
            if (password !== confirmPassword) {
                alert('كلمات المرور غير متطابقة');
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
            alert('تم إنشاء الحساب بنجاح!');
            
            // Clear form fields - مسح حقول النموذج
            registerForm.reset();
            
            // Switch to login tab - التبديل إلى تبويب تسجيل الدخول
            tabButtons[0].click();
        });
    }
    
    // Add scroll to top button functionality - إضافة وظيفة زر التمرير إلى الأعلى
    // Create the button if it doesn't exist - إنشاء الزر إذا لم يكن موجودًا
    if (!document.querySelector('.scroll-to-top')) {
        const scrollButton = document.createElement('div');
        scrollButton.className = 'scroll-to-top';
        document.body.appendChild(scrollButton);
        
        // Add event listener to scroll to top - إضافة مستمع حدث للتمرير إلى الأعلى
        // Make the button scroll the page to the top when clicked
        // جعل الزر يمرر الصفحة إلى الأعلى عند النقر عليه
        scrollButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide button based on scroll position - إظهار/إخفاء الزر بناءً على موضع التمرير
        // Control button visibility depending on how far the user has scrolled
        // التحكم في رؤية الزر اعتمادًا على مدى تمرير المستخدم
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('visible');
            } else {
                scrollButton.classList.remove('visible');
            }
        });
    }
    
    // Add smooth scroll effect to section links - إضافة تأثير التمرير السلس لروابط القسم
    // Enable smooth scrolling when clicking on anchor links
    // تمكين التمرير السلس عند النقر على روابط المرساة
    const pageLinks = document.querySelectorAll('a[href^="#"]');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}); 