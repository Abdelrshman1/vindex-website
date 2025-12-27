// ===================================
// VINDEX Luxury Perfumes - JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  // ===================================
  // PRELOADER
  // ===================================
  const preloader = document.getElementById('preloader');
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 1500);
  });

  // ===================================
  // NAVIGATION
  // ===================================
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // ===================================
  // SMOOTH SCROLLING
  // ===================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===================================
  // COLLECTION CARD LINKS
  // ===================================
  const cardButtons = document.querySelectorAll('.card-btn');
  cardButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const category = btn.dataset.target;
      
      // Scroll to order section
      document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Wait for scroll then trigger category selection
      setTimeout(() => {
        const categoryBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
        if (categoryBtn) {
          categoryBtn.click();
        }
      }, 800);
    });
  });

  // ===================================
  // ORDER SYSTEM
  // ===================================
  
  // Google Sheets Configuration
  const SHEET_ID = '1nyF7bI1i80KWQoa2nE6Xv9-JFKfq8wiptxuzV3w3SvE';
  
  // Sheet names (make sure these match exactly with your Google Sheets tab names)
  const MEN_SHEET_NAME = 'Men Perfumes';
  const WOMEN_SHEET_NAME = 'Women Perfume';

  // State
  let selectedCategory = null;
  let selectedPerfume = null;
  let selectedPrice = null;
  let perfumesData = {
    men: [],
    women: []
  };

  // DOM Elements
  const stepCategory = document.getElementById('step-category');
  const stepPerfume = document.getElementById('step-perfume');
  const stepDetails = document.getElementById('step-details');
  const stepSuccess = document.getElementById('step-success');
  
  const categoryBtns = document.querySelectorAll('.category-btn');
  const backToCategoryBtn = document.getElementById('back-to-category');
  const backToPerfumeBtn = document.getElementById('back-to-perfume');
  
  const loadingSpinner = document.getElementById('loading-spinner');
  const perfumeGrid = document.getElementById('perfume-grid');
  const perfumeStepTitle = document.getElementById('perfume-step-title');
  
  const summaryPerfumeName = document.getElementById('summary-perfume-name');
  const summaryPerfumePrice = document.getElementById('summary-perfume-price');
  
  const customerForm = document.getElementById('customer-form');
  const submitOrderBtn = document.getElementById('submit-order');
  const newOrderBtn = document.getElementById('new-order');

  // Parse CSV text to array of objects
  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const perfumes = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle CSV with possible quoted values
      let name = '';
      let price = 0;
      
      // Simple CSV parsing (handles most cases)
      const match = line.match(/^"?([^",]*)"?,\s*"?(\d+)"?/);
      if (match) {
        name = match[1].trim();
        price = parseInt(match[2]) || 0;
      } else {
        // Fallback: split by comma
        const parts = line.split(',');
        if (parts.length >= 2) {
          name = parts[0].replace(/"/g, '').trim();
          price = parseInt(parts[1].replace(/"/g, '').trim()) || 0;
        }
      }
      
      if (name && price > 0) {
        perfumes.push({ name, price });
      }
    }
    
    return perfumes;
  }

  // Fetch perfumes using JSONP approach (works without CORS)
  async function fetchPerfumesJSONP(category) {
    return new Promise((resolve) => {
      const sheetName = category === 'men' ? MEN_SHEET_NAME : WOMEN_SHEET_NAME;
      const callbackName = 'googleSheetCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create callback function
      window[callbackName] = function(data) {
        try {
          const rows = data.table.rows;
          const perfumes = rows
            .filter(row => row.c && row.c[0] && row.c[0].v)
            .map(row => ({
              name: String(row.c[0]?.v || '').trim(),
              price: parseInt(row.c[1]?.v) || 0
            }))
            .filter(p => p.name && p.price > 0);
          
          console.log(`Parsed ${perfumes.length} perfumes from ${sheetName}`);
          resolve(perfumes);
        } catch (e) {
          console.error('Error parsing JSONP:', e);
          resolve([]);
        }
        
        // Cleanup
        delete window[callbackName];
        const script = document.getElementById(callbackName);
        if (script) script.remove();
      };
      
      // Create script tag for JSONP
      const script = document.createElement('script');
      script.id = callbackName;
      const encodedSheetName = encodeURIComponent(sheetName);
      script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&sheet=${encodedSheetName}`;
      
      script.onerror = () => {
        console.error('JSONP script load failed for sheet:', sheetName);
        delete window[callbackName];
        const s = document.getElementById(callbackName);
        if (s) s.remove();
        resolve([]);
      };
      
      document.head.appendChild(script);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (window[callbackName]) {
          console.log('JSONP timeout for sheet:', sheetName);
          delete window[callbackName];
          const s = document.getElementById(callbackName);
          if (s) s.remove();
          resolve([]);
        }
      }, 10000);
    });
  }

  // Main fetch function with fallback
  async function fetchPerfumes(category) {
    try {
      // Try JSONP approach first
      const perfumes = await fetchPerfumesJSONP(category);
      
      if (perfumes.length > 0) {
        console.log(`Loaded ${perfumes.length} ${category} perfumes from Google Sheets`);
        return perfumes;
      }
      
      throw new Error('No perfumes returned');
    } catch (error) {
      console.error('Error fetching perfumes:', error);
      console.log('Using fallback data...');
      return getFallbackPerfumes(category);
    }
  }

  // Fallback perfume data in case Google Sheets doesn't work
  function getFallbackPerfumes(category) {
    if (category === 'men') {
      return [
        { name: "Sauvage Dior EDT", price: 350 },
        { name: "One Million Paco Rabanne", price: 350 },
        { name: "Versace Eros", price: 350 },
        { name: "Bleu de Chanel", price: 350 },
        { name: "YSL Y", price: 350 },
        { name: "Invictus", price: 350 },
        { name: "Acqua Di Gio", price: 350 },
        { name: "Stronger With You", price: 350 },
        { name: "Dunhill Desire Red", price: 350 },
        { name: "Mont Blanc Legend", price: 350 },
        { name: "Club De Nuit Intense", price: 350 },
        { name: "Hugo Boss Bottled", price: 350 },
        { name: "Lacoste Blanc", price: 350 },
        { name: "Givenchy Gentlemen", price: 350 },
        { name: "Azzaro Wanted", price: 350 },
        { name: "Bvlgari Man in Black", price: 350 },
        { name: "Rasasi Hawas", price: 350 },
        { name: "Creed Aventus", price: 550 },
        { name: "Sauvage Dior Elixir", price: 550 },
        { name: "Oud Wood Tom Ford", price: 550 },
        { name: "Tuscan Leather Tom Ford", price: 550 },
        { name: "Amouage Interlude", price: 550 },
        { name: "Parfums de Marly Layton", price: 550 },
        { name: "Tobacco Vanille Tom Ford", price: 550 },
        { name: "Nishane Hacivat", price: 550 },
        { name: "Initio Rehab", price: 550 },
        { name: "Roja Elysium", price: 550 }
      ];
    } else {
      return [
        { name: "Vanilla Musk", price: 350 },
        { name: "Sweet Rose", price: 350 },
        { name: "Fresh Citrus", price: 350 },
        { name: "White Jasmine", price: 350 },
        { name: "Ocean Breeze", price: 350 },
        { name: "Cherry Blossom", price: 350 },
        { name: "Peach Garden", price: 350 },
        { name: "Pink Berry", price: 350 },
        { name: "Soft Musk", price: 350 },
        { name: "Coconut Dream", price: 350 },
        { name: "Floral Fantasy", price: 350 },
        { name: "Lavender Sky", price: 350 },
        { name: "Berry Vanilla", price: 350 },
        { name: "White Musk", price: 350 },
        { name: "Baccarat Rouge 540", price: 550 },
        { name: "Delina", price: 550 },
        { name: "Oriana", price: 550 },
        { name: "Rose Prick", price: 550 },
        { name: "Velvet Orchid", price: 550 },
        { name: "L'interdit", price: 550 },
        { name: "Black Saffron", price: 550 }
      ];
    }
  }

  // Show step
  function showStep(step) {
    [stepCategory, stepPerfume, stepDetails, stepSuccess].forEach(s => {
      s.classList.add('hidden');
    });
    step.classList.remove('hidden');
  }

  // Render perfumes
  function renderPerfumes(perfumes) {
    perfumeGrid.innerHTML = '';
    
    if (perfumes.length === 0) {
      perfumeGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
          <p>No perfumes available at the moment.</p>
          <p style="font-size: 0.9rem; margin-top: 10px;">Please try again later or contact us on WhatsApp.</p>
        </div>
      `;
      return;
    }
    
    perfumes.forEach(perfume => {
      const item = document.createElement('div');
      item.className = 'perfume-item';
      item.dataset.name = perfume.name;
      item.dataset.price = perfume.price;
      item.innerHTML = `
        <span class="perfume-name">${perfume.name}</span>
        <span class="perfume-price">${perfume.price} EGP</span>
      `;
      
      item.addEventListener('click', () => {
        // Remove selection from others
        document.querySelectorAll('.perfume-item').forEach(p => p.classList.remove('selected'));
        // Add selection to clicked
        item.classList.add('selected');
        
        selectedPerfume = perfume.name;
        selectedPrice = perfume.price;
        
        // Update summary
        summaryPerfumeName.textContent = selectedPerfume;
        summaryPerfumePrice.textContent = `${selectedPrice} EGP`;
        
        // Show details step
        setTimeout(() => {
          showStep(stepDetails);
        }, 300);
      });
      
      perfumeGrid.appendChild(item);
    });
  }

  // Category selection
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      selectedCategory = btn.dataset.category;
      perfumeStepTitle.textContent = selectedCategory === 'men' ? 'Select Men\'s Perfume' : 'Select Women\'s Perfume';
      
      showStep(stepPerfume);
      loadingSpinner.classList.remove('hidden');
      perfumeGrid.innerHTML = '';
      
      // Check if we already have the data cached
      if (perfumesData[selectedCategory].length > 0) {
        loadingSpinner.classList.add('hidden');
        renderPerfumes(perfumesData[selectedCategory]);
      } else {
        // Fetch from Google Sheets
        const perfumes = await fetchPerfumes(selectedCategory);
        perfumesData[selectedCategory] = perfumes;
        loadingSpinner.classList.add('hidden');
        renderPerfumes(perfumes);
      }
    });
  });

  // Back buttons
  backToCategoryBtn.addEventListener('click', () => {
    showStep(stepCategory);
    selectedPerfume = null;
    selectedPrice = null;
  });

  backToPerfumeBtn.addEventListener('click', () => {
    showStep(stepPerfume);
  });

  // Form submission
  customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    
    if (!name || !phone || !address) {
      alert('Please fill in all fields');
      return;
    }
    
    // Disable button during submission
    submitOrderBtn.disabled = true;
    submitOrderBtn.innerHTML = '<span>Processing...</span>';
    
    // Prepare order data
    const orderData = {
      name,
      phone,
      address,
      category: selectedCategory === 'men' ? "Men's" : "Women's",
      perfume: selectedPerfume,
      price: selectedPrice
    };
    
    // Create WhatsApp message (using simple text without special characters)
  /*  const message = 
      `*New Order - VINDEX*\n` +
      `----------------\n` +
      `*Name:* ${orderData.name}\n` +
      `*Phone:* ${orderData.phone}\n` +
      `*Address:* ${orderData.address}\n` +
      `----------------\n` +
      `*Category:* ${orderData.category}\n` +
      `*Perfume:* ${orderData.perfume}\n` +
      `*Price:* ${orderData.price} EGP\n` +
      `----------------\n` +
      `Thank you for choosing VINDEX!`; */
    
  //  const whatsappURL = `https://wa.me/201055741189?text=${encodeURIComponent(message)}`;
    
    // Send order to Google Sheets using Google Apps Script
    try {
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxmwMmepgNIyVbc0sspTtONXfSeMbXXCixmtCCIW8HvudfssC4xsjT6NQMG7DZmoGBQ/exec';
      
      const formData = new FormData();
      formData.append('name', orderData.name);
      formData.append('phone', orderData.phone);
      formData.append('address', orderData.address);
      formData.append('category', orderData.category);
      formData.append('perfume', orderData.perfume);
      formData.append('price', orderData.price);
      
      await fetch(scriptURL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });
      console.log('Order sent to Google Sheets');
    } catch (error) {
      console.log('Sheet logging error:', error);
    }
    
    // Show success and open WhatsApp
    showStep(stepSuccess);
    
    // Reset button
    submitOrderBtn.disabled = false;
    submitOrderBtn.innerHTML = `
      <span>Complete Order</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
     }); 

  // New order button
  newOrderBtn.addEventListener('click', () => {
    // Reset form
    customerForm.reset();
    selectedCategory = null;
    selectedPerfume = null;
    selectedPrice = null;
    
    // Show first step
    showStep(stepCategory);
    
    // Scroll to order section
    document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ===================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ===================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe sections for fade-in animation
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
  });

  // Hero section should be visible immediately
  document.querySelector('.hero').style.opacity = '1';
  document.querySelector('.hero').style.transform = 'translateY(0)';

  // ===================================
  // PREFETCH PERFUME DATA
  // ===================================
  // Prefetch data after page load for faster UX
  setTimeout(async () => {
    if (perfumesData.men.length === 0) {
      perfumesData.men = await fetchPerfumes('men');
    }
    if (perfumesData.women.length === 0) {
      perfumesData.women = await fetchPerfumes('women');
    }
    console.log('Perfume data prefetched');
  }, 2000);
});
