document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    if (typeof checkAdminStatus !== 'function' || !checkAdminStatus()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get admin name from session storage
    const adminName = document.getElementById('admin-name');
    if (adminName) {
        adminName.textContent = sessionStorage.getItem('adminUsername') || 'مدير النظام';
    }
    
    // Tab switching functionality
    const menuItems = document.querySelectorAll('.admin-menu li');
    const sections = document.querySelectorAll('.admin-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get the target tab
            const targetTab = item.getAttribute('data-tab');
            
            // Remove active class from all menu items and sections
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked menu item and corresponding section
            item.classList.add('active');
            document.getElementById(`${targetTab}-section`).classList.add('active');
            
            // Load data for the selected tab
            if (targetTab === 'products') {
                loadProducts();
            } else if (targetTab === 'purchase-history') {
                loadPurchaseHistory();
            } else if (targetTab === 'dashboard') {
                loadDashboardStats();
                loadActivities();
            }
        });
    });
    
    // Products Management
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const cancelProductBtn = document.getElementById('cancel-product');
    const newProductForm = document.getElementById('new-product-form');
    const productsTableBody = document.getElementById('products-table-body');
    
    // Show product form
    if (addProductBtn && productForm) {
        addProductBtn.addEventListener('click', () => {
            productForm.style.display = 'block';
            // Scroll to form
            productForm.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Cancel product form
    if (cancelProductBtn && productForm) {
        cancelProductBtn.addEventListener('click', () => {
            productForm.style.display = 'none';
            newProductForm.reset();
        });
    }
    
    // Load initial data
    loadDashboardStats();
    loadProducts();
    loadActivities();
    
    // Purchase history functionality
    function loadPurchaseHistory() {
        const purchaseHistoryTable = document.getElementById('purchase-history-table-body');
        if (!purchaseHistoryTable) return;
        
        // Clear existing rows
        purchaseHistoryTable.innerHTML = '';
        
        // Get purchase history from localStorage
        const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        
        // Update the stats
        updatePurchaseStats(purchases);
        
        // Add rows to the table
        purchases.forEach(purchase => {
            const row = createPurchaseHistoryRow(purchase);
            purchaseHistoryTable.appendChild(row);
        });
        
        // If no sales, show a message
        if (purchases.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 20px;">
                    لا توجد مبيعات سابقة
                </td>
            `;
            purchaseHistoryTable.appendChild(emptyRow);
        }
        
        // Add event listeners to the search and filter controls
        setupPurchaseHistoryFilters();
    }
    
    function createPurchaseHistoryRow(purchase) {
        const row = document.createElement('tr');
        
        // Format date
        const purchaseDate = new Date(purchase.date);
        const formattedDate = purchaseDate.toLocaleDateString('ar-EG');
        
        // Determine status class and text
        let statusClass = 'inactive';
        let statusText = 'قيد المعالجة';
        
        if (purchase.status === 'completed') {
            statusClass = 'active';
            statusText = 'مكتمل';
        } else if (purchase.status === 'cancelled') {
            statusClass = 'inactive';
            statusText = 'ملغي';
        }
        
        row.innerHTML = `
            <td>${purchase.id}</td>
            <td>${purchase.username || 'غير معروف'}</td>
            <td>${purchase.product.name}</td>
            <td>${purchase.product.price} EGP</td>
            <td>${formattedDate}</td>
            <td>${purchase.paymentMethod || 'غير محدد'}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" data-id="${purchase.id}">عرض</button>
                </div>
            </td>
        `;
        
        // Add event listener to the view button
        const viewBtn = row.querySelector('.edit-btn');
        viewBtn.addEventListener('click', () => {
            viewPurchaseDetails(purchase);
        });
        
        return row;
    }
    
    function viewPurchaseDetails(purchase) {
        // In a real app, this would open a modal with purchase details
        // For now, we'll just show an alert
        alert(`
            تفاصيل الطلب #${purchase.id}
            
            المستخدم: ${purchase.username || 'غير معروف'}
            المنتج: ${purchase.product.name}
            السعر: ${purchase.product.price} EGP
            تاريخ الشراء: ${new Date(purchase.date).toLocaleDateString('ar-EG')}
            طريقة الدفع: ${purchase.paymentMethod || 'غير محدد'}
            الحالة: ${purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'cancelled' ? 'ملغي' : 'قيد المعالجة'}
        `);
    }
    
    function setupPurchaseHistoryFilters() {
        const searchInput = document.getElementById('purchase-search');
        const dateFilter = document.getElementById('date-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', filterPurchaseHistory);
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', filterPurchaseHistory);
        }
    }
    
    function filterPurchaseHistory() {
        const searchInput = document.getElementById('purchase-search');
        const dateFilter = document.getElementById('date-filter');
        const purchaseHistoryTable = document.getElementById('purchase-history-table-body');
        
        if (!purchaseHistoryTable) return;
        
        // Get all purchases
        const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        
        // Apply filters
        let filteredPurchases = purchases;
        
        // Apply search filter if provided
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filteredPurchases = filteredPurchases.filter(purchase => 
                purchase.id.toString().includes(searchTerm) || 
                (purchase.username && purchase.username.toLowerCase().includes(searchTerm)) ||
                purchase.product.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply date filter if selected
        if (dateFilter && dateFilter.value !== 'all') {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            if (dateFilter.value === 'today') {
                filteredPurchases = filteredPurchases.filter(purchase => {
                    const purchaseDate = new Date(purchase.date);
                    return purchaseDate >= startOfDay;
                });
            } else if (dateFilter.value === 'week') {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                
                filteredPurchases = filteredPurchases.filter(purchase => {
                    const purchaseDate = new Date(purchase.date);
                    return purchaseDate >= startOfWeek;
                });
            } else if (dateFilter.value === 'month') {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                
                filteredPurchases = filteredPurchases.filter(purchase => {
                    const purchaseDate = new Date(purchase.date);
                    return purchaseDate >= startOfMonth;
                });
            }
        }
        
        // Clear existing rows
        purchaseHistoryTable.innerHTML = '';
        
        // Add filtered rows
        filteredPurchases.forEach(purchase => {
            const row = createPurchaseHistoryRow(purchase);
            purchaseHistoryTable.appendChild(row);
        });
        
        // If no results, show a message
        if (filteredPurchases.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 20px;">
                    لا توجد مبيعات تطابق البحث
                </td>
            `;
            purchaseHistoryTable.appendChild(emptyRow);
        }
    }
    
    function updatePurchaseStats(purchases) {
        const ordersCount = document.getElementById('orders-count');
        const revenueCount = document.getElementById('revenue-count');
        
        if (ordersCount) {
            ordersCount.textContent = purchases.length;
        }
        
        if (revenueCount) {
            // Calculate total revenue from completed sales
            const totalRevenue = purchases
                .filter(purchase => purchase.status === 'completed')
                .reduce((total, purchase) => total + Number(purchase.product.price), 0);
            
            revenueCount.textContent = `${totalRevenue} EGP`;
        }
    }
    
    // Load products from localStorage
    function loadProducts() {
        if (!productsTableBody) return;
        
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Update products count in dashboard
        const productsCount = document.getElementById('products-count');
        if (productsCount) {
            productsCount.textContent = products.length;
        }
        
        // Clear existing rows
        productsTableBody.innerHTML = '';
        
        // Add products to table
        products.forEach((product, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="product-cell">
                        <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}">
                        <div>
                            <h4>${product.name}</h4>
                            <p>SKU: P${1000 + index}</p>
                        </div>
                    </div>
                </td>
                <td>${product.category || 'أخرى'}</td>
                <td>${product.price} ${product.currency || 'EGP'}</td>
                <td>${product.stock || 0}</td>
                <td>${product.discount || '0%'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${index}">تعديل</button>
                        <button class="delete-btn" data-id="${index}">حذف</button>
                    </div>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                editProduct(parseInt(productId));
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                deleteProduct(parseInt(productId));
            });
        });
    }
    
    // Add new product
    if (newProductForm) {
        newProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const currency = document.getElementById('product-currency').value;
            const category = document.getElementById('product-category').value;
            const stock = document.getElementById('product-stock').value;
            const description = document.getElementById('product-description').value;
            const image = document.getElementById('product-image').value;
            const note = document.getElementById('product-note').value;
            
            // Call of Duty specific fields
            const level = document.getElementById('product-level').value;
            const kd = document.getElementById('product-kd').value;
            const rank = document.getElementById('product-rank').value;
            const skins = document.getElementById('product-skins').value;
            
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            products.push({
                name,
                price,
                currency,
                category,
                stock,
                description,
                image,
                note,
                // Call of Duty specific data
                level,
                kd,
                rank,
                skins,
                discount: '0%',
                seller: sessionStorage.getItem('adminUsername') || 'مدير النظام'
            });
            
            localStorage.setItem('products', JSON.stringify(products));
            
            // Add to activity
            addActivity(`تم إضافة منتج جديد: ${name}`);
            
            // Show success message
            alert('تم إضافة المنتج بنجاح');
            
            // Reset form and hide it
            newProductForm.reset();
            productForm.style.display = 'none';
            
            // Reload products table
            loadProducts();
        });
    }
    
    // Edit product function
    function editProduct(index) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const product = products[index];
        
        if (!product) return;
        
        // Fill form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-currency').value = product.currency || 'EGP';
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-note').value = product.note || '';
        
        // Set Call of Duty specific fields
        document.getElementById('product-level').value = product.level || '';
        document.getElementById('product-kd').value = product.kd || '';
        document.getElementById('product-rank').value = product.rank || '';
        document.getElementById('product-skins').value = product.skins || '';
        
        // Show form
        productForm.style.display = 'block';
        productForm.scrollIntoView({ behavior: 'smooth' });
        
        // Update submit handler for edit
        const originalSubmitHandler = newProductForm.onsubmit;
        newProductForm.onsubmit = (e) => {
            e.preventDefault();
            
            products[index] = {
                name: document.getElementById('product-name').value,
                price: document.getElementById('product-price').value,
                currency: document.getElementById('product-currency').value,
                category: document.getElementById('product-category').value,
                stock: document.getElementById('product-stock').value,
                description: document.getElementById('product-description').value,
                image: document.getElementById('product-image').value,
                note: document.getElementById('product-note').value,
                // Call of Duty specific data
                level: document.getElementById('product-level').value,
                kd: document.getElementById('product-kd').value,
                rank: document.getElementById('product-rank').value,
                skins: document.getElementById('product-skins').value,
                discount: product.discount || '0%',
                seller: product.seller || sessionStorage.getItem('adminUsername') || 'مدير النظام'
            };
            
            localStorage.setItem('products', JSON.stringify(products));
            
            // Add to activity
            addActivity(`تم تعديل منتج: ${products[index].name}`);
            
            // Show success message
            alert('تم تعديل المنتج بنجاح');
            
            // Reset form and hide it
            newProductForm.reset();
            productForm.style.display = 'none';
            
            // Restore original submit handler
            newProductForm.onsubmit = originalSubmitHandler;
            
            // Reload products table
            loadProducts();
        };
    }
    
    // Delete product function
    function deleteProduct(index) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const productName = products[index].name;
        
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Add to activity
        addActivity(`تم حذف منتج: ${productName}`);
        
        // Reload products table
        loadProducts();
    }
    
    // Discounts Management
    const addDiscountBtn = document.getElementById('add-discount-btn');
    const discountForm = document.getElementById('discount-form');
    const cancelDiscountBtn = document.getElementById('cancel-discount');
    const newDiscountForm = document.getElementById('new-discount-form');
    const discountsTableBody = document.getElementById('discounts-table-body');
    
    // Show discount form
    if (addDiscountBtn && discountForm) {
        addDiscountBtn.addEventListener('click', () => {
            discountForm.style.display = 'block';
            // Scroll to form
            discountForm.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Cancel discount form
    if (cancelDiscountBtn && discountForm) {
        cancelDiscountBtn.addEventListener('click', () => {
            discountForm.style.display = 'none';
            newDiscountForm.reset();
        });
    }
    
    // Add new discount
    if (newDiscountForm) {
        newDiscountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('discount-name').value;
            const code = document.getElementById('discount-code').value;
            const type = document.getElementById('discount-type').value;
            const value = document.getElementById('discount-value').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const applicableTo = document.getElementById('applicable-products').value;
            
            const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
            discounts.push({
                name,
                code,
                type,
                value: type === 'percentage' ? `${value}%` : `${value} EGP`,
                startDate,
                endDate,
                applicableTo,
                status: 'active'
            });
            
            localStorage.setItem('discounts', JSON.stringify(discounts));
            
            // Add to activity
            addActivity(`تم إضافة خصم جديد: ${name} (${code})`);
            
            // Show success message
            alert('تم إضافة الخصم بنجاح');
            
            // Reset form and hide it
            newDiscountForm.reset();
            discountForm.style.display = 'none';
            
            // Apply discount to products if applicable
            if (applicableTo === 'all') {
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                products.forEach(product => {
                    product.discount = type === 'percentage' ? `${value}%` : `${value} EGP`;
                });
                localStorage.setItem('products', JSON.stringify(products));
                
                // Reload products table
                loadProducts();
            }
        });
    }
    
    // Recent Activity Management
    const activityList = document.querySelector('.activity-list');
    
    function loadActivities() {
        if (!activityList) return;
        
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        // Show only last 5 activities
        const recentActivities = activities.slice(-5).reverse();
        
        // Clear existing activities
        activityList.innerHTML = '';
        
        // Add activities to list
        recentActivities.forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-details">
                    <p>${activity.text}</p>
                    <span class="activity-meta">بواسطة: ${activity.user}</span>
                </div>
            `;
            activityList.appendChild(div);
        });
    }
    
    function addActivity(text) {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        // Get current time
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        activities.push({
            time,
            text,
            user: sessionStorage.getItem('adminUsername') || 'مدير النظام'
        });
        
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Reload activities
        loadActivities();
    }
    
    // Logout functionality
    const logoutLink = document.querySelector('a[href="login.html"]');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear admin session
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
}); 