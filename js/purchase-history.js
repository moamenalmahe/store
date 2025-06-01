/**
 * Purchase History Functionality
 * وظائف سجل المشتريات
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isUserLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true' || 
                         (typeof checkAdminStatus === 'function' && checkAdminStatus());
    
    if (!isUserLoggedIn) {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    // Get purchase history container
    const purchaseHistoryContainer = document.getElementById('purchase-history-container');
    const noPurchasesDiv = document.getElementById('no-purchases');
    
    // Load purchase history from localStorage
    loadPurchaseHistory();
    
    // Function to load purchase history
    function loadPurchaseHistory() {
        // In a real app, you would fetch this data from a server
        // For this demo, we'll use localStorage
        const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        
        // If no purchases, show the "no purchases" message
        if (purchases.length === 0) {
            // Remove example items (they are just for demonstration)
            const exampleItems = document.querySelectorAll('.purchase-item');
            exampleItems.forEach(item => item.remove());
            
            // Show the "no purchases" message
            noPurchasesDiv.style.display = 'block';
            return;
        }
        
        // Otherwise, hide the "no purchases" message
        noPurchasesDiv.style.display = 'none';
        
        // Remove example items (they are just for demonstration)
        const exampleItems = document.querySelectorAll('.purchase-item');
        exampleItems.forEach(item => item.remove());
        
        // Add actual purchase items
        purchases.forEach(purchase => {
            const purchaseItem = createPurchaseItem(purchase);
            purchaseHistoryContainer.appendChild(purchaseItem);
        });
    }
    
    // Function to create a purchase item element
    function createPurchaseItem(purchase) {
        const div = document.createElement('div');
        div.className = 'purchase-item';
        
        // Format date
        const purchaseDate = new Date(purchase.date);
        const formattedDate = purchaseDate.toLocaleDateString('ar-EG');
        
        // Determine status class
        let statusClass = 'status-pending';
        if (purchase.status === 'completed') {
            statusClass = 'status-completed';
        } else if (purchase.status === 'cancelled') {
            statusClass = 'status-cancelled';
        }
        
        // Translate status
        let statusText = 'قيد المعالجة';
        if (purchase.status === 'completed') {
            statusText = 'مكتمل';
        } else if (purchase.status === 'cancelled') {
            statusText = 'ملغي';
        }
        
        div.innerHTML = `
            <div class="purchase-header">
                <div class="purchase-id">#${purchase.id}</div>
                <div class="purchase-date">${formattedDate}</div>
            </div>
            <div class="purchase-details">
                <div class="product-info">
                    <div class="product-image">
                        <img src="${purchase.product.image || 'https://via.placeholder.com/80'}" alt="${purchase.product.name}">
                    </div>
                    <div class="product-text">
                        <h3>${purchase.product.name}</h3>
                        <p>${purchase.product.description || ''}</p>
                    </div>
                </div>
                <div class="purchase-meta">
                    <div class="purchase-price">${purchase.product.price} EGP</div>
                    <div class="purchase-status ${statusClass}">${statusText}</div>
                </div>
            </div>
            <div class="purchase-actions">
                ${purchase.status === 'completed' ? '<button class="action-btn download-btn">تحميل التفاصيل</button>' : ''}
                <button class="action-btn view-details-btn">عرض التفاصيل</button>
            </div>
        `;
        
        // Add event listeners
        const viewDetailsBtn = div.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                showPurchaseDetails(purchase);
            });
        }
        
        const downloadBtn = div.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadPurchaseDetails(purchase);
            });
        }
        
        return div;
    }
    
    // Function to show purchase details
    function showPurchaseDetails(purchase) {
        // In a real app, this would open a modal with purchase details
        alert(`تفاصيل الطلب #${purchase.id}\n\nالمنتج: ${purchase.product.name}\nالسعر: ${purchase.product.price} EGP\nتاريخ الشراء: ${new Date(purchase.date).toLocaleDateString('ar-EG')}`);
    }
    
    // Function to download purchase details
    function downloadPurchaseDetails(purchase) {
        // In a real app, this would generate and download a PDF or text file
        alert(`جاري تحميل تفاصيل الطلب #${purchase.id}`);
    }
}); 