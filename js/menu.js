/**
 * Menu and Search Functionality
 * وظائف القائمة والبحث
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const menuOverlay = document.getElementById('menu-overlay');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Show admin control panel button if logged in as admin
    const navMenu = document.querySelector('.nav-menu');
    const loginLink = navMenu.querySelector('a[href="login.html"]');
    
    // Check if user is logged in (admin or regular user)
    const isUserLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true' || 
                          (typeof checkAdminStatus === 'function' && checkAdminStatus());
    
    // Add purchase history link to menu for logged-in users
    if (isUserLoggedIn) {
        // Find the quick links section in the menu overlay
        const quickLinksSection = document.querySelector('.menu-section ul');
        if (quickLinksSection) {
            // Check if purchase history link already exists
            const existingLink = quickLinksSection.querySelector('a[href="purchase-history.html"]');
            
            // Only add if it doesn't already exist
            if (!existingLink) {
                // Create purchase history list item
                const purchaseHistoryItem = document.createElement('li');
                const purchaseHistoryLink = document.createElement('a');
                purchaseHistoryLink.href = 'purchase-history.html';
                
                // Use different text for admin vs regular users
                if (typeof checkAdminStatus === 'function' && checkAdminStatus()) {
                    purchaseHistoryLink.textContent = 'سجل المبيعات';
                } else {
                    purchaseHistoryLink.textContent = 'سجل المشتريات';
                }
                
                purchaseHistoryItem.appendChild(purchaseHistoryLink);
                
                // Add to the quick links section
                quickLinksSection.appendChild(purchaseHistoryItem);
            }
        }
    }
    
    // Check if user is admin and add control panel link
    if (typeof checkAdminStatus === 'function' && checkAdminStatus()) {
        // Create control panel list item
        const controlPanelItem = document.createElement('li');
        
        // Create control panel link
        const controlPanelLink = document.createElement('a');
        controlPanelLink.href = 'admin-panel.html';
        controlPanelLink.textContent = 'لوحة التحكم';
        
        // Add CSS class instead of inline styles
        controlPanelLink.classList.add('control-panel-link');
        
        // Add link to list item
        controlPanelItem.appendChild(controlPanelLink);
        
        // Insert before the menu toggle button
        const menuToggleItem = navMenu.querySelector('.menu-toggle-item');
        navMenu.insertBefore(controlPanelItem, menuToggleItem);
        
        // Change login link text to "تسجيل الخروج" (Sign Out)
        if (loginLink) {
            loginLink.textContent = 'تسجيل الخروج';
            
            // Add logout functionality
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Clear admin session
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminUsername');
                sessionStorage.removeItem('userLoggedIn');
                sessionStorage.removeItem('username');
                
                // Redirect to login page
                window.location.href = 'login.html';
            });
        }
    }
    
    // Toggle menu open
    if (menuToggleBtn && menuOverlay) {
        menuToggleBtn.addEventListener('click', function() {
            // Make sure closing class is removed
            menuOverlay.classList.remove('closing');
            menuOverlay.style.display = 'block';
            
            // Add active class after a short delay to trigger transition
            setTimeout(() => {
                menuOverlay.classList.add('active');
            }, 10);
            
            // Prevent scrolling on body when menu is open
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close menu
    if (closeMenuBtn && menuOverlay) {
        closeMenuBtn.addEventListener('click', function() {
            closeMenu();
        });
        
        // Close menu when clicking on overlay (outside menu content)
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                closeMenu();
            }
        });
        
        // Close menu with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
        
        // Allow search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Function to close menu
    function closeMenu() {
        // Add closing class first for faster blur transition
        menuOverlay.classList.add('closing');
        menuOverlay.classList.remove('active');
        
        // Wait for transition to finish before hiding
        setTimeout(() => {
            menuOverlay.style.display = 'none';
            // Restore scrolling
            document.body.style.overflow = 'auto';
            // Remove closing class after the menu is hidden
            menuOverlay.classList.remove('closing');
        }, 250); // Slightly faster timing to match the updated CSS transition
    }
    
    // Function to perform search
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // In a real app, you'd handle the search logic here
            // For now, we'll redirect to products page with a query parameter
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }
    
    // Mark current page in navigation
    markActivePage();
    
    // Function to highlight current page in menu
    function markActivePage() {
        const currentPath = window.location.pathname;
        const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        
        // Get all menu links
        const navLinks = document.querySelectorAll('.nav-menu a');
        const menuLinks = document.querySelectorAll('.menu-section ul a');
        
        // Check main navigation links
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === filename) {
                link.classList.add('active-page');
            }
        });
        
        // Check menu links
        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === filename) {
                link.classList.add('active-page');
            }
        });
    }
}); 