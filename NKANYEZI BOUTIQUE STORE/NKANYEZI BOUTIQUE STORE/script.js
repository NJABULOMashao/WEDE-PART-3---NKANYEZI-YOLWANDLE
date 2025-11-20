
// Cart functionality
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        this.updateCartCount();
        this.initEventListeners();
    }

    // Initialize event listeners
    initEventListeners() {
        // Add to cart buttons on product page
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn') || e.target.classList.contains('add-to-chart')) {
                const productCard = e.target.closest('.product-card');
                const name = e.target.dataset.name || productCard.querySelector('h3').textContent;
                const price = parseInt(e.target.dataset.price || productCard.dataset.price);
                const image = productCard.querySelector('img').src;
                
                this.addToCart(name, price, image);
            }
        });

        // Search functionality
        const searchButton = document.querySelector('.search-button');
        const searchInput = document.getElementById('search');
        
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => this.searchProducts());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchProducts();
            });
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Load cart items if on chart page
        if (document.querySelector('.chart-section')) {
            this.loadCartItems();
        }
    }

    // Add item to cart
    addToCart(name, price, image) {
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartMessage(name);
        
        // If on chart page, refresh the display
        if (document.querySelector('.chart-section')) {
            this.loadCartItems();
        }
    }

    // Remove item from cart
    removeFromCart(name) {
        this.cart = this.cart.filter(item => item.name !== name);
        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
    }

    // Update item quantity
    updateQuantity(name, change) {
        const item = this.cart.find(item => item.name === name);
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.removeFromCart(name);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.loadCartItems();
            }
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
    }

    // Update cart count in navigation
    updateCartCount() {
        const cartCount = document.getElementById('chart-count');
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        // Update all cart counts on the page
        const allCartCounts = document.querySelectorAll('#chart-count');
        allCartCounts.forEach(count => {
            count.textContent = totalItems;
        });
    }

    // Load and display cart items on chart page
    loadCartItems() {
        const chartItemsList = document.getElementById('chart-items-list');
        if (!chartItemsList) return;

        if (this.cart.length === 0) {
            chartItemsList.innerHTML = `
                <div class="empty-chart-message">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <h4>Your chart is empty</h4>
                    <p>Browse our products and add items to your chart</p>
                    <a href="product.html" class="browse-btn">Browse Products</a>
                </div>
            `;
            this.updateTotals();
            return;
        }

        let cartHTML = '';
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            cartHTML += `
                <div class="cart-item-detailed">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">R${item.price}</div>
                        <div class="cart-item-controls-detailed">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.name}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.name}', 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="cart.removeFromCart('${item.name}')">
                                <i class="fa-solid fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                    <div class="item-total">R${itemTotal}</div>
                </div>
            `;
        });

        chartItemsList.innerHTML = cartHTML;
        this.updateTotals();
    }

    // Update cart totals
    updateTotals() {
        const subtotalElement = document.getElementById('subtotal-amount');
        const totalElement = document.getElementById('total-amount');
        
        if (subtotalElement && totalElement) {
            const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            const shipping = 100;
            const total = subtotal + shipping;
            
            subtotalElement.textContent = subtotal;
            totalElement.textContent = total;
        }
    }

    // Search products
    searchProducts() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Show add to cart message
    showAddToCartMessage(productName) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fa-solid fa-check"></i>
            <span>${productName} added to chart!</span>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#cart-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'cart-notification-styles';
            styles.textContent = `
                .cart-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease-out;
                    max-width: 300px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .cart-notification i {
                    font-size: 1.2rem;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Checkout functionality
    checkout() {
        if (this.cart.length === 0) {
            alert('Your chart is empty!');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 100;
        
        if (confirm(`Proceed to checkout? Total: R${total}`)) {
            // Here you would typically redirect to a checkout page
            // For now, we'll just clear the cart and show a message
            alert('Thank you for your purchase! Your order has been placed.');
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.loadCartItems();
        }
    }

    // Clear entire cart
    clearCart() {
        if (this.cart.length > 0 && confirm('Are you sure you want to clear your chart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.loadCartItems();
        }
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart item count
    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Add slideOut animation to styles
    if (!document.querySelector('#slide-out-animation')) {
        const slideOutStyles = document.createElement('style');
        slideOutStyles.id = 'slide-out-animation';
        slideOutStyles.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(slideOutStyles);
    }
});

// Product filtering functionality (for future enhancement)
class ProductFilter {
    constructor() {
        this.products = Array.from(document.querySelectorAll('.product-card'));
        this.initFilters();
    }

    initFilters() {
        // This can be expanded with category filters
        console.log('Product filter initialized');
    }

    filterByCategory(category) {
        this.products.forEach(product => {
            if (category === 'all' || product.dataset.category === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }
}

// Initialize product filter if on products page
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.products-section')) {
        window.productFilter = new ProductFilter();
    }
});

// Utility functions
const CartUtils = {
    formatPrice(price) {
        return 'R' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for use in other files (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart, ProductFilter, CartUtils };
}