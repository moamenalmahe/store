/**
 * Utility Functions for BOA STORE
 * Contains reusable helper functions that can be used across the site
 */

/**
 * Shows a notification message
 * @param {string} message - The message to show
 * @param {string} type - The message type ('success', 'error', 'info', 'warning')
 * @param {number} duration - How long to show the message in milliseconds
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add active class for animation
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

/**
 * Format price with currency
 * @param {number} price - The price to format
 * @param {string} currency - Currency code (default: 'EGP')
 * @return {string} - Formatted price with currency
 */
function formatPrice(price, currency = 'EGP') {
    return `${price} ${currency}`;
}

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @return {string|null} - Parameter value or null if not found
 */
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Validate form input
 * @param {HTMLFormElement} form - The form to validate
 * @return {boolean} - True if valid, false if invalid
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                isValid = false;
                input.classList.add('error');
            }
        }
    });
    
    return isValid;
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @return {Function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

/**
 * Scroll to element smoothly
 * @param {HTMLElement|string} element - Element or selector to scroll to
 */
function scrollToElement(element) {
    const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Add a scroll to top button to the page
 */
function addScrollToTopButton() {
    // Create the button if it doesn't exist
    if (!document.querySelector('.scroll-to-top')) {
        const scrollButton = document.createElement('div');
        scrollButton.className = 'scroll-to-top';
        document.body.appendChild(scrollButton);
        
        // Add event listener to scroll to top
        scrollButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('visible');
            } else {
                scrollButton.classList.remove('visible');
            }
        });
    }
}

/**
 * Check if the current user is an admin
 * التحقق مما إذا كان المستخدم الحالي مسؤولاً
 * @returns {boolean} true if admin, false otherwise
 */
function checkAdminStatus() {
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const adminUsername = sessionStorage.getItem('adminUsername');
    
    // Check if admin is logged in with proper credentials
    if (adminLoggedIn === 'true' && adminUsername) {
        console.log('Admin status: true - User is an admin');
        return true;
    }
    
    console.log('Admin status: false - User is not an admin');
    return false;
}

// Initialize utility functions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll to top button if needed
    if (typeof addScrollToTopButton === 'function') {
        addScrollToTopButton();
    }
    
    // Add smooth scroll to all anchor links
    const pageLinks = document.querySelectorAll('a[href^="#"]');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                scrollToElement(targetId);
            }
        });
    });
}); 