// Router configuration
const routes = {
  '/': {
    template: '/index.html',
    title: 'BlueTEXT.in - Development Resources & Tools'
  },
  '/about': {
    template: '/nav/about.html',
    title: 'About - BlueTEXT.in'
  },
  '/services': {
    template: '/nav/Services.html',
    title: 'Services - BlueTEXT.in'
  },
  '/portfolio': {
    template: '/nav/Portfolio.html',
    title: 'Portfolio - BlueTEXT.in'
  },
  '/blog': {
    template: '/nav/blog.html',
    title: 'Blog - BlueTEXT.in'
  },
  '/contact': {
    template: '/nav/contact.html',
    title: 'Contact - BlueTEXT.in'
  },
  '/courses': {
    template: '/nav/courses.html',
    title: 'Courses - BlueTEXT.in'
  },
  '/shop': {
    template: '/nav/Shop.html',
    title: 'Shop - BlueTEXT.in'
  },
  '/tools': {
    template: '/nav/tools.html',
    title: 'Tools - BlueTEXT.in'
  },
  '/apps': {
    template: '/nav/apps.html',
    title: 'Apps - BlueTEXT.in'
  },
  '/privacy': {
    template: '/footer/GDPRCompliantPrivacyPolicy.html',
    title: 'Privacy Policy - BlueTEXT.in'
  },
  '/terms': {
    template: '/footer/Terms&Conditions.html',
    title: 'Terms & Conditions - BlueTEXT.in'
  },
  '/license': {
    template: '/footer/LICENSE.html',
    title: 'License - BlueTEXT.in'
  }
};

class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }

  init() {
    // Handle initial route
    this.handleRoute(window.location.pathname);

    // Handle browser navigation
    window.addEventListener('popstate', (e) => {
      this.handleRoute(window.location.pathname);
    });

    // Handle link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const url = new URL(link.href);
        this.navigate(url.pathname);
      }
    });
  }

  async handleRoute(pathname) {
    const route = this.routes[pathname] || this.routes['/'];
    
    try {
      const response = await fetch(route.template);
      if (!response.ok) throw new Error('Page not found');
      
      const html = await response.text();
      
      // Update content
      const main = document.querySelector('main');
      if (main) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('main') || doc.querySelector('#content-container');
        if (content) {
          main.innerHTML = content.innerHTML;
        }
      }
      
      // Update metadata
      document.title = route.title;
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Initialize page-specific functionality
      this.initPageSpecific(pathname);
      
    } catch (error) {
      console.error('Error loading page:', error);
      this.showError();
    }
  }

  navigate(pathname) {
    window.history.pushState({}, '', pathname);
    this.handleRoute(pathname);
  }

  initPageSpecific(pathname) {
    // Initialize functionality based on the current page
    switch(pathname) {
      case '/shop':
        // Initialize shop functionality
        if (typeof Shop !== 'undefined') {
          new Shop();
        }
        break;
      case '/apps':
        // Initialize apps page specific features
        this.loadAppPreviews();
        break;
      // Add more page-specific initializations as needed
    }
  }

  showError() {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="error-page">
          <h1>Page Not Found</h1>
          <p>Sorry, the page you're looking for doesn't exist.</p>
          <a href="/" class="btn">Go Home</a>
        </div>
      `;
    }
  }

  loadAppPreviews() {
    // Load app preview images and initialize interactive features
    const previewImages = document.querySelectorAll('.app-preview img[data-src]');
    previewImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Initialize router
const router = new Router(routes);