// Performance optimized JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components with intersection observer for lazy loading
  initComponents();
  
  // Setup navigation
  setupNavigation();
  
  // Initialize shop functionality if on shop page
  if (document.querySelector('.shop-grid')) {
    initShop();
  }
});

// Component initialization with lazy loading
function initComponents() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1
  });

  // Observe elements that should be lazy loaded
  document.querySelectorAll('.lazy-load').forEach(el => observer.observe(el));
}

// Navigation setup with performance optimizations
function setupNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navContainer = document.querySelector('.nav-container');
  
  if (menuToggle && navContainer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navContainer.classList.toggle('active');
    });
  }

  // Optimize scroll performance
  let lastScroll = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const header = document.querySelector('.header');
        const currentScroll = window.scrollY;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        ticking = false;
      });
      
      ticking = true;
    }
  });
}

// Shop functionality
function initShop() {
  const cart = {
    items: [],
    total: 0
  };

  // Add to cart functionality
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const product = {
        id: card.dataset.id,
        name: card.querySelector('.product-title').textContent,
        price: parseFloat(card.querySelector('.product-price').dataset.price)
      };
      
      addToCart(product);
      updateCartUI();
    });
  });

  function addToCart(product) {
    const existingItem = cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        ...product,
        quantity: 1
      });
    }
    
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total');
    
    if (cartCount) {
      cartCount.textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    if (cartTotal) {
      cartTotal.textContent = `$${cart.total.toFixed(2)}`;
    }
  }

  // Load cart from localStorage
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    Object.assign(cart, JSON.parse(savedCart));
    updateCartUI();
  }
}

// Utilities
function debounce(func, wait) {
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

// Handle client-side routing
function handleRouting() {
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', async (e) => {
      const href = link.getAttribute('href');
      
      // Only handle internal links
      if (href.startsWith('/')) {
        e.preventDefault();
        
        try {
          const response = await fetch(href);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.querySelector('main');
          
          if (content) {
            document.querySelector('main').innerHTML = content.innerHTML;
            window.history.pushState({}, '', href);
          }
        } catch (error) {
          console.error('Error loading page:', error);
          window.location.href = href;
        }
      }
    });
  });
}

// Initialize routing
handleRouting();