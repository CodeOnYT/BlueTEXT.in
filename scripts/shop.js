// Initialize Stripe
const stripe = Stripe('your_publishable_key'); // Replace with your Stripe publishable key

// Shop functionality
class Shop {
  constructor() {
    this.cart = {
      items: [],
      total: 0
    };
    this.init();
  }

  init() {
    this.loadCart();
    this.setupEventListeners();
    this.updateCartUI();
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  setupEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToCart(e));
    });

    // Cart toggle
    const cartToggle = document.querySelector('.cart-toggle');
    if (cartToggle) {
      cartToggle.addEventListener('click', () => this.toggleCart());
    }

    // Close cart
    const closeCart = document.querySelector('.close-cart');
    if (closeCart) {
      closeCart.addEventListener('click', () => this.toggleCart());
    }

    // Checkout button
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => this.handleCheckout());
    }
  }

  handleAddToCart(event) {
    const card = event.target.closest('.product-card');
    const product = {
      id: card.dataset.id,
      name: card.querySelector('.product-title').textContent,
      price: parseFloat(card.querySelector('.product-price').dataset.price),
      image: card.querySelector('.product-image').src
    };

    const existingItem = this.cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.items.push({
        ...product,
        quantity: 1
      });
    }

    this.updateCartTotal();
    this.saveCart();
    this.updateCartUI();
    this.showNotification('Added to cart');
  }

  updateCartTotal() {
    this.cart.total = this.cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  updateCartUI() {
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = itemCount;
    }

    // Update cart items
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
      cartItems.innerHTML = this.cart.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <div class="cart-item-actions">
            <button class="quantity-decrease">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-increase">+</button>
            <button class="remove-item">×</button>
          </div>
        </div>
      `).join('');

      // Add event listeners for quantity buttons
      cartItems.querySelectorAll('.quantity-decrease, .quantity-increase, .remove-item')
        .forEach(button => {
          button.addEventListener('click', (e) => this.handleQuantityChange(e));
        });
    }

    // Update total
    const cartTotal = document.querySelector('.cart-total span');
    if (cartTotal) {
      cartTotal.textContent = this.cart.total.toFixed(2);
    }
  }

  handleQuantityChange(event) {
    const cartItem = event.target.closest('.cart-item');
    const itemId = cartItem.dataset.id;
    const item = this.cart.items.find(item => item.id === itemId);

    if (!item) return;

    if (event.target.classList.contains('quantity-decrease')) {
      if (item.quantity > 1) {
        item.quantity--;
      }
    } else if (event.target.classList.contains('quantity-increase')) {
      item.quantity++;
    } else if (event.target.classList.contains('remove-item')) {
      this.cart.items = this.cart.items.filter(i => i.id !== itemId);
    }

    this.updateCartTotal();
    this.saveCart();
    this.updateCartUI();
  }

  toggleCart() {
    const sidebar = document.querySelector('.cart-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  async handleCheckout() {
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: this.cart.items,
        }),
      });

      const session = await response.json();

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      this.showNotification('Error processing checkout. Please try again.');
    }
  }
}

// Initialize shop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const shop = new Shop();
});