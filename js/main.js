// main.js - Professional VINDEX Website

// =====================
// Global Variables
// =====================
let currentStep = 1;
const totalSteps = 4;
let orderData = {
  size: null,
  bottle: null,
  menPerfume: null,
  womenPerfume: null,
  totalPrice: 0
};

// =====================
// Initialize on DOM Load
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initializePreloader();
  initializeNavigation();
  initializeCustomizer();
  initializeReviewsSwiper();
  initializeBackToTop();
  initializeAOS();
  initializeSmoothScroll();
});

// =====================
// Preloader
// =====================
function initializePreloader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }
    }, 1000);
  });
}

// =====================
// Navigation
// =====================
function initializeNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbar = document.querySelector('.navbar');
  
  // Mobile menu toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
    });
  });
  
  // Active link on scroll
  window.addEventListener('scroll', () => {
    // Navbar background on scroll
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    
    // Active section highlighting
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
}

// =====================
// Perfume Customizer
// =====================
function initializeCustomizer() {
  // Initialize step cards
  initializeStepCards();
  
  // Initialize navigation buttons
  initializeStepNavigation();
  
  // Initialize selects
  initializeSelects();
  
  // Initialize checkout
  initializeCheckout();
  
  // Initialize form submission
  initializeOrderForm();

  initializePerfumeFilters();
}

function initializeStepCards() {
  // Size cards
  const sizeCards = document.querySelectorAll('.custom-step[data-step="1"] .option-card');
  const sizeSelect = document.getElementById('perfume-size');
  
  sizeCards.forEach(card => {
    card.addEventListener('click', () => {
      sizeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const value = card.dataset.value;
      const price = card.dataset.price;
      
      if (sizeSelect) {
        sizeSelect.value = value;
        sizeSelect.dispatchEvent(new Event('change'));
      }
      
      orderData.size = value;
      updateOrderSummary();
    });
  });
  
  // Bottle cards
  const bottleCards = document.querySelectorAll('.custom-step[data-step="2"] .option-card');
  const bottleSelect = document.getElementById('bottle-type');
  
  bottleCards.forEach(card => {
    card.addEventListener('click', () => {
      bottleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const value = card.dataset.value;
      const price = card.dataset.price;
      
      if (bottleSelect) {
        bottleSelect.value = value;
        bottleSelect.dispatchEvent(new Event('change'));
      }
      
      orderData.bottle = value;
      updateOrderSummary();
    });
  });
}

function initializeStepNavigation() {
  const prevBtn = document.querySelector('.btn-prev');
  const nextBtn = document.querySelector('.btn-next');
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        // Validate current step
        if (validateStep(currentStep)) {
          currentStep++;
          updateStepDisplay();
        } else {
          showNotification('Please complete this step before proceeding', 'warning');
        }
      }
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
      }
    });
  }
}

function validateStep(step) {
  switch(step) {
    case 1: return orderData.size !== null;
    case 2: return orderData.bottle !== null;
    case 3: return true; // Men's perfume is optional
    case 4: return true; // Women's perfume is optional
    default: return true;
  }
}

function updateStepDisplay() {
  // Update progress bar
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach((step, index) => {
    if (index + 1 < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (index + 1 === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
  
  // Update step content
  const customSteps = document.querySelectorAll('.custom-step');
  customSteps.forEach(step => {
    if (parseInt(step.dataset.step) === currentStep) {
      step.classList.add('step-active');
    } else {
      step.classList.remove('step-active');
    }
  });
  
  // Update navigation buttons
  const prevBtn = document.querySelector('.btn-prev');
  const nextBtn = document.querySelector('.btn-next');
  
  if (prevBtn) {
    prevBtn.disabled = currentStep === 1;
  }
  
  if (nextBtn) {
    nextBtn.textContent = currentStep === totalSteps ? 'Complete' : 'Next';
    if (currentStep === totalSteps) {
      nextBtn.innerHTML = 'Complete <i class="fas fa-check"></i>';
    } else {
      nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }
  }
}

function initializeSelects() {
  const selects = [
    'perfume-size',
    'bottle-type',
    'alcohol-type',
    'packaging-select'
  ];
  
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.addEventListener('change', updateOrderSummary);
    }
  });
}

function updateOrderSummary() {
  const sizeSelect = document.getElementById('perfume-size');
  const bottleSelect = document.getElementById('bottle-type');
  const menSelect = document.getElementById('alcohol-type');
  const womenSelect = document.getElementById('packaging-select');
  
  // Get prices
  const sizePrice = parseInt(sizeSelect?.selectedOptions[0]?.dataset.price || 0);
  const bottlePrice = parseInt(bottleSelect?.selectedOptions[0]?.dataset.price || 0);
  const menPrice = parseInt(menSelect?.selectedOptions[0]?.dataset.price || 0);
  const womenPrice = parseInt(womenSelect?.selectedOptions[0]?.dataset.price || 0);
  
  // Calculate total
  const basePrice = 200; // Base price for 50ml
  const total = basePrice + sizePrice + bottlePrice + menPrice + womenPrice;
  
  // Update order data
  orderData.totalPrice = total;
  orderData.menPerfume = menSelect?.value || null;
  orderData.womenPerfume = womenSelect?.value || null;
  
  // Update display
  document.getElementById('summary-size').textContent = sizeSelect?.value || 'Not selected';
  document.getElementById('summary-bottle').textContent = bottleSelect?.value || 'Not selected';
  document.getElementById('summary-alcohol').textContent = menSelect?.value || 'Not selected';
  document.getElementById('summary-packaging').textContent = womenSelect?.value || 'Not selected';
  document.getElementById('total-price').textContent = `${total} EGP`;
  
  // Enable checkout if at least one perfume is selected
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.disabled = !sizeSelect?.value || !bottleSelect?.value || 
                          (!menSelect?.value && !womenSelect?.value);
  }
}

function initializeCheckout() {
  const checkoutBtn = document.getElementById('checkout-button');
  const customerForm = document.getElementById('customer-form');
  const orderSummary = document.querySelector('.order-summary-card');
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (orderSummary) {
        orderSummary.style.display = 'none';
      }
      if (customerForm) {
        customerForm.style.display = 'block';
        customerForm.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

function initializeOrderForm() {
  const form = document.getElementById('order-form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submit-order');
      const originalText = submitBtn.innerHTML;
      
      // Get form data
      const name = document.getElementById('customer-name').value;
      const phone = document.getElementById('customer-phone').value;
      const address = document.getElementById('customer-address').value;
      
      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      
      // Prepare WhatsApp message
      const message = formatWhatsAppMessage({
        name,
        phone,
        address,
        ...orderData
      });
      
      // Send to WhatsApp
      const whatsappUrl = `https://wa.me/201055741189?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Try to send to Google Sheets
      try {
        await sendToGoogleSheets({
          name,
          phone,
          address,
          ...orderData
        });
        
        showNotification('Order sent successfully! 🎉', 'success');
        form.reset();
        resetCustomizer();
      } catch (error) {
        console.error('Error sending to sheets:', error);
        showNotification('Order sent via WhatsApp!', 'success');
      }
      
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  }
}

function formatWhatsAppMessage(data) {
  const items = [];
  
  if (data.size) items.push(`📏 Size: ${data.size}`);
  if (data.bottle) items.push(`🍾 Bottle: ${data.bottle}`);
  if (data.menPerfume) items.push(`👨 Men's: ${data.menPerfume}`);
  if (data.womenPerfume) items.push(`👩 Women's: ${data.womenPerfume}`);
  
  return `🎯 *NEW ORDER - VINDEX*
━━━━━━━━━━━━━━━
👤 *Customer Details*
Name: ${data.name}
Phone: ${data.phone}
Address: ${data.address}

📦 *Order Details*
${items.join('\n')}

💰 *Total: ${data.totalPrice} EGP*
━━━━━━━━━━━━━━━`;
}

async function sendToGoogleSheets(data) {
  const scriptURL = 'YOUR_GOOGLE_SCRIPT_URL'; // Replace with actual URL
  
  const response = await fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  return response;
}

function resetCustomizer() {
  // Reset all selections
  orderData = {
    size: null,
    bottle: null,
    menPerfume: null,
    womenPerfume: null,
    totalPrice: 0
  };
  
  // Reset UI
  currentStep = 1;
  updateStepDisplay();
  
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  document.querySelectorAll('select').forEach(select => {
    select.value = '';
  });
  
  updateOrderSummary();
  
  // Hide forms
  document.getElementById('customer-form').style.display = 'none';
  document.querySelector('.order-summary-card').style.display = 'block';
}

// =====================
// Reviews Swiper
// =====================
function initializeReviewsSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper('.reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
    });
  }
}

// =====================
// Back to Top Button
// =====================
function initializeBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// =====================
// Initialize AOS
// =====================
function initializeAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });
  }
}

// =====================
// Smooth Scroll
// =====================
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed header
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// =====================
// Notification System
// =====================
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add styles
  const styles = `
    .notification {
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--black-secondary);
      color: var(--text-light);
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      border-left: 4px solid;
      max-width: 300px;
    }
    
    .notification-success {
      border-color: #4CAF50;
    }
    
    .notification-warning {
      border-color: var(--gold-primary);
    }
    
    .notification-error {
      border-color: #f44336;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  
  // Add styles if not already added
  if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function getNotificationIcon(type) {
  switch(type) {
    case 'success': return 'fa-check-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'error': return 'fa-times-circle';
    default: return 'fa-info-circle';
  }
}

// =====================
// Performance Optimization
// =====================
// Debounce function for scroll events
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

// Optimize scroll events
window.addEventListener('scroll', debounce(() => {
  // Handle any scroll-based animations or updates
}, 10));

// =====================
// Lazy Loading Images
// =====================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

function initializePerfumeFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const filter = this.dataset.filter;
      const parent = this.closest('.custom-step');
      const select = parent.querySelector('.perfume-select');
      
      // Update active tab
      parent.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Filter options
      if (select) {
        const options = select.querySelectorAll('option');
        const optgroups = select.querySelectorAll('optgroup');
        
        if (filter === 'all') {
          // Show all options
          options.forEach(opt => opt.style.display = '');
          optgroups.forEach(grp => grp.style.display = '');
        } else if (filter === 'classic') {
          // Show only 200 EGP options
          optgroups.forEach(grp => {
            if (grp.label.includes('Classic')) {
              grp.style.display = '';
            } else {
              grp.style.display = 'none';
            }
          });
        } else if (filter === 'niche') {
          // Show only 400 EGP options
          optgroups.forEach(grp => {
            if (grp.label.includes('Niche')) {
              grp.style.display = '';
            } else {
              grp.style.display = 'none';
            }
          });
        }
      }
    });
  });
}