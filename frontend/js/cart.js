// Global Cart Management relying on LocalStorage
const cartManager = {
    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCountUI();
    },

    addToCart(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        this.saveCart(cart);
        this.showToast(`${product.name} added to cart!`);
    },

    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
    },

    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart(cart);
        }
    },

    clearCart() {
        localStorage.removeItem('cart');
        this.updateCartCountUI();
    },

    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    updateCartCountUI() {
        const cartCounters = document.querySelectorAll('.cart-count');
        const cart = this.getCart();
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
        });
    },

    showToast(message) {
        // Create toast dynamically if not exists
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.style.cssText = `
                position: fixed; bottom: 20px; right: 20px;
                background: var(--secondary-color, #111827); color: white;
                padding: 12px 24px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 500;
                transform: translateY(100px); opacity: 0; transition: all 0.3s ease;
                z-index: 10000; font-family: 'Inter', sans-serif;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
        }, 3000);
    }
};

// Initialize Cart Count on Load
document.addEventListener('DOMContentLoaded', () => {
    cartManager.updateCartCountUI();
});

window.cartManager = cartManager;
