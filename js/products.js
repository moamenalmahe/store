document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');
    const productDetailContainer = document.querySelector('.product-detail-container');
    
    // Load products from localStorage
    function loadProducts() {
        if (!productsGrid) return;
        
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        
        // If we have stored products, clear the grid and display them
        if (storedProducts.length > 0) {
            productsGrid.innerHTML = '';
            
            storedProducts.forEach((product, index) => {
                const productCard = createProductCard(product, index);
                productsGrid.appendChild(productCard);
            });
        }
    }
    
    // Load a single product for the product details page
    function loadProductDetails() {
        if (!productDetailContainer) return;
        
        // Get the product ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId === null) {
            productDetailContainer.innerHTML = '<div class="error-message">المنتج غير موجود</div>';
            return;
        }
        
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const product = products[productId];
        
        if (!product) {
            productDetailContainer.innerHTML = '<div class="error-message">المنتج غير موجود</div>';
            return;
        }
        
        displayProductDetails(product);
    }
    
    // Display product details on the product details page
    function displayProductDetails(product) {
        // Format COD-specific details
        const rank = product.rank ? `<div class="detail-item"><span class="detail-label">الرتبة:</span> <span class="detail-value">${product.rank}</span></div>` : '';
        const kd = product.kd ? `<div class="detail-item"><span class="detail-label">K/D:</span> <span class="detail-value">${product.kd}</span></div>` : '';
        const level = product.level ? `<div class="detail-item"><span class="detail-label">المستوى:</span> <span class="detail-value">${product.level}</span></div>` : '';
        const skins = product.skins ? `<div class="detail-item"><span class="detail-label">السكنات:</span> <span class="detail-value">${product.skins}</span></div>` : '';
        
        // Build the product details HTML
        productDetailContainer.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-header">
                    <div class="product-detail-image">
                        <img src="${product.image || 'https://via.placeholder.com/600x400'}" alt="${product.name}">
                        ${product.category ? `<div class="product-category ${product.category}">${getCategoryName(product.category)}</div>` : ''}
                    </div>
                    <div class="product-detail-info">
                        <h1>${product.name}</h1>
                        <div class="product-detail-price">${product.price} ${product.currency || 'EGP'}</div>
                        <p class="product-description">${product.description || 'وصف للحساب هنا. هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.'}</p>
                        
                        <div class="product-specs">
                            <h3>مواصفات الحساب</h3>
                            ${rank}
                            ${kd}
                            ${level}
                            ${skins}
                        </div>
                        
                        <div class="secure-note detail-secure-note">
                            <i class="lock-icon"></i>
                            <p>تفاصيل الحساب (البريد الإلكتروني وكلمة المرور) ستكون متاحة بعد إتمام عملية الشراء</p>
                        </div>
                        
                        <button id="buy-now-btn" class="buy-now-btn">شراء الآن</button>
                    </div>
                </div>
                
                <div class="product-reviews">
                    <h2>آراء العملاء</h2>
                    <div class="reviews-container" id="reviews-container">
                        <!-- Reviews will be loaded here -->
                    </div>
                    
                    <div class="add-review">
                        <h3>أضف رأيك</h3>
                        <div class="rating-selector">
                            <span>التقييم:</span>
                            <div class="stars">
                                <span class="star" data-rating="1">★</span>
                                <span class="star" data-rating="2">★</span>
                                <span class="star" data-rating="3">★</span>
                                <span class="star" data-rating="4">★</span>
                                <span class="star" data-rating="5">★</span>
                            </div>
                        </div>
                        <input type="text" id="review-name" placeholder="الاسم" required>
                        <textarea id="review-text" placeholder="اكتب رأيك هنا..." rows="4" required></textarea>
                        <button id="submit-review" class="submit-review">إرسال</button>
                    </div>
                </div>
            </div>
        `;
        
        // Load reviews for this product
        loadReviews(product);
        
        // Setup event listeners
        setupBuyButton(product);
        setupReviewSubmission(product);
        setupRatingSelector();
    }
    
    // Create product card element
    function createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Show discount if available
        let priceHTML = `<p class="product-price">${product.price} ${product.currency || 'EGP'}</p>`;
        if (product.discount && product.discount !== '0%') {
            const originalPrice = parseInt(product.price);
            let discountAmount = 0;
            
            if (product.discount.includes('%')) {
                const discountPercent = parseInt(product.discount);
                discountAmount = originalPrice * (discountPercent / 100);
            } else if (product.discount.includes('EGP')) {
                discountAmount = parseInt(product.discount);
            }
            
            const discountedPrice = originalPrice - discountAmount;
            
            priceHTML = `
                <p class="product-price">
                    <span class="discounted-price">${discountedPrice} ${product.currency || 'EGP'}</span>
                    <span class="original-price">${product.price} ${product.currency || 'EGP'}</span>
                    <span class="discount-badge">-${product.discount}</span>
                </p>
            `;
        }
        
        // Add seller info if available
        let sellerHTML = '';
        if (product.seller) {
            sellerHTML = `<div class="seller-info-small">البائع: ${product.seller}</div>`;
        }
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p>${product.description?.substring(0, 60) || 'وصف المنتج غير متوفر'}...</p>
                ${priceHTML}
                ${sellerHTML}
                <a href="product-details.html?id=${index}" class="product-btn">عرض التفاصيل</a>
            </div>
        `;
        
        return card;
    }
    
    // Helper function to get readable category names
    function getCategoryName(category) {
        const categories = {
            'warzone': 'Warzone',
            'modern-warfare': 'Modern Warfare',
            'black-ops': 'Black Ops',
            'vanguard': 'Vanguard'
        };
        return categories[category] || category;
    }
    
    // Load reviews for a product
    function loadReviews(product) {
        const reviewsContainer = document.getElementById('reviews-container');
        if (!reviewsContainer) return;
        
        // Get reviews from localStorage
        const allReviews = JSON.parse(localStorage.getItem('product_reviews') || '{}');
        const productId = product.id || product.name; // Use id or name as a unique identifier
        const reviews = allReviews[productId] || [];
        
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="no-reviews">لا توجد آراء لهذا المنتج حتى الآن. كن أول من يضيف رأيه!</div>';
            return;
        }
        
        // Display reviews
        reviewsContainer.innerHTML = '';
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            
            // Create stars HTML
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHtml += '<span class="star filled">★</span>';
                } else {
                    starsHtml += '<span class="star">★</span>';
                }
            }
            
            reviewElement.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-name">${review.name}</div>
                    <div class="review-rating">${starsHtml}</div>
                </div>
                <div class="review-text">${review.text}</div>
                <div class="review-date">${new Date(review.date).toLocaleDateString('ar-EG')}</div>
            `;
            
            reviewsContainer.appendChild(reviewElement);
        });
    }
    
    // Setup the Buy Now button
    function setupBuyButton(product) {
        const buyButton = document.getElementById('buy-now-btn');
        if (!buyButton) return;
        
        buyButton.addEventListener('click', () => {
            // Show account details modal
            showAccountDetails(product);
        });
    }
    
    // Show account details after successful purchase
    function showAccountDetails(product) {
        // Generate fake account details for demo purposes
        // In a real application, these would come from a secure database
        const accountEmail = `cod_account_${Math.floor(1000 + Math.random() * 9000)}@example.com`;
        const accountPassword = `SecurePass${Math.floor(1000 + Math.random() * 9000)}`;
        const accountUsername = `Player_${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Create purchase receipt modal
        const modal = document.createElement('div');
        modal.className = 'purchase-modal';
        
        modal.innerHTML = `
            <div class="purchase-modal-content">
                <span class="close-modal">&times;</span>
                <h2>تمت عملية الشراء بنجاح!</h2>
                <div class="purchase-details">
                    <h3>${product.name}</h3>
                    <p>شكراً لشرائك من BOA STORE. فيما يلي تفاصيل الحساب:</p>
                    
                    <div class="account-details">
                        <div class="account-detail">
                            <strong>البريد الإلكتروني:</strong>
                            <span>${accountEmail}</span>
                        </div>
                        <div class="account-detail">
                            <strong>كلمة المرور:</strong>
                            <span>${accountPassword}</span>
                        </div>
                        <div class="account-detail">
                            <strong>اسم المستخدم:</strong>
                            <span>${accountUsername}</span>
                        </div>
                    </div>
                    
                    <div class="purchase-note">
                        <h4>تعليمات مهمة:</h4>
                        <p>${product.note || 'يرجى تغيير كلمة المرور فور تسجيل الدخول للحفاظ على أمان الحساب. في حال واجهتك أي مشكلة، يرجى التواصل مع فريق الدعم.'}</p>
                    </div>
                    
                    <p class="security-warning">هذه المعلومات سرية، يرجى الاحتفاظ بها في مكان آمن.</p>
                    
                    <button class="save-details-btn">حفظ التفاصيل</button>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Handle close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Handle save details button
        const saveBtn = modal.querySelector('.save-details-btn');
        saveBtn.addEventListener('click', () => {
            alert('تم نسخ تفاصيل الحساب. يمكنك الاحتفاظ بها في مكان آمن.');
            
            try {
                // Create a text version of the account info to copy
                const accountInfo = `
                ${product.name}
                البريد الإلكتروني: ${accountEmail}
                كلمة المرور: ${accountPassword}
                اسم المستخدم: ${accountUsername}
                
                تعليمات: ${product.note || 'يرجى تغيير كلمة المرور فور تسجيل الدخول للحفاظ على أمان الحساب.'}
                `;
                
                // Copy to clipboard
                navigator.clipboard.writeText(accountInfo.trim())
                    .then(() => console.log('Account info copied to clipboard'))
                    .catch(err => console.error('Failed to copy: ', err));
            } catch (err) {
                console.error('Copy to clipboard failed:', err);
            }
        });
    }
    
    // Setup review submission
    function setupReviewSubmission(product) {
        const submitButton = document.getElementById('submit-review');
        if (!submitButton) return;
        
        submitButton.addEventListener('click', () => {
            const nameInput = document.getElementById('review-name');
            const textInput = document.getElementById('review-text');
            const rating = document.querySelector('.rating-selector').getAttribute('data-selected-rating') || 5;
            
            if (!nameInput.value.trim() || !textInput.value.trim()) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            // Save review
            saveReview(product, {
                name: nameInput.value.trim(),
                text: textInput.value.trim(),
                rating: parseInt(rating),
                date: new Date().toISOString()
            });
            
            // Clear form
            nameInput.value = '';
            textInput.value = '';
            document.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
            
            // Reload reviews
            loadReviews(product);
        });
    }
    
    // Save a review to localStorage
    function saveReview(product, review) {
        const allReviews = JSON.parse(localStorage.getItem('product_reviews') || '{}');
        const productId = product.id || product.name; // Use id or name as a unique identifier
        
        if (!allReviews[productId]) {
            allReviews[productId] = [];
        }
        
        allReviews[productId].push(review);
        localStorage.setItem('product_reviews', JSON.stringify(allReviews));
    }
    
    // Setup the rating selector
    function setupRatingSelector() {
        const stars = document.querySelectorAll('.rating-selector .star');
        const ratingSelector = document.querySelector('.rating-selector');
        
        if (!stars.length || !ratingSelector) return;
        
        // Set default rating
        ratingSelector.setAttribute('data-selected-rating', '5');
        stars.forEach(star => {
            if (parseInt(star.getAttribute('data-rating')) <= 5) {
                star.classList.add('selected');
            }
        });
        
        // Add click events
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                ratingSelector.setAttribute('data-selected-rating', rating);
                
                // Update visual selection
                stars.forEach(s => {
                    const starRating = parseInt(s.getAttribute('data-rating'));
                    if (starRating <= rating) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });
        });
    }
    
    // Initialize
    loadProducts();
    loadProductDetails();
}); 