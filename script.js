// DOM Elements
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("reservation-date");
const timeSelect = document.getElementById("time");
const themeToggle = document.getElementById("themeToggle");

// ── Device detection ────────────────────────────────────
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ── FIX #9 — scroll hints ──────────────────────────────
const scrollHintMouse = document.querySelector('.scroll-hint-mouse');
const scrollHintTouch = document.querySelector('.scroll-hint-touch');

if (scrollHintMouse && scrollHintTouch) {
  scrollHintMouse.style.display = isTouchDevice ? 'none' : '';
  scrollHintTouch.style.display = isTouchDevice ? '' : 'none';
}

// ── Date validation ────────────────────────────────────
if (dateInput) {
  const tomorrow = new Date(Date.now() + 86400000);
  const maxDate = new Date(Date.now() + 90 * 86400000);

  dateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
  dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

  dateInput.addEventListener('change', updateAvailableTimes);
}

function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();

  timeSelect.querySelectorAll('option').forEach((option) => {
    if (!option.value) return;

    const [optHours, optMins] = option.value.split(':').map(Number);

    if (selectedDate === todayStr) {
      const isPast = optHours < currentHours || (optHours === currentHours && optMins <= currentMins + 30);
      option.disabled = isPast;
      if (isPast && option.selected) {
        timeSelect.value = '';
      }
    } else {
      option.disabled = false;
    }
  });
}

// ── Theme Toggle ──────────────────────────────────────
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
});

// ── Navigation scroll effect ──────────────────────────
function handleScroll() {
  const currentScroll = window.scrollY;
  nav.classList.toggle('scrolled', currentScroll > 50);

  if (!isTouchDevice) {
    if (heroBg) {
      heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
    }
    if (reservationBg && currentScroll > window.innerHeight) {
      const sectionTop = document.getElementById('reservation').offsetTop;
      const offset = (currentScroll - sectionTop) * 0.3;
      reservationBg.style.transform = `translateY(${offset}px)`;
    }
  }

  updateActiveNavLink();
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 150;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ── Mobile menu ────────────────────────────────────────
function toggleMobileMenu() {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
  navToggle.classList.remove('active');
  navMenu.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Menu search & filter ──────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const menuSearch = document.getElementById('menu-search');

function filterMenuItems(filter = 'all', searchText = '') {
  const menuItems = document.querySelectorAll('.menu-item');
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const itemName = item.querySelector('h3').textContent.toLowerCase();
    const category = item.dataset.category;
    const matchesSearch = itemName.includes(searchText.toLowerCase());
    const matchesFilter = filter === 'all' || category === filter;

    if (matchesSearch && matchesFilter) {
      item.classList.remove('hidden-item');
      visibleCount++;
    } else {
      item.classList.add('hidden-item');
    }
  });

  let noResults = document.querySelector('.no-results');
  if (!visibleCount) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'no-results';
      noResults.textContent = 'No menu items found.';
      document.querySelector('.menu-content').appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filterMenuItems(btn.dataset.filter, menuSearch ? menuSearch.value : '');
  });
});

if (menuSearch) {
  menuSearch.addEventListener('input', () => {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    filterMenuItems(activeFilter, menuSearch.value);
  });
}

// ── Smooth scroll ──────────────────────────────────────
function smoothScroll(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: targetSection.offsetTop - 80,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }
  closeMobileMenu();
}

// ── Reservation form submission ──────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();

  const inputs = reservationForm.querySelectorAll('input, select, textarea');
  let isValid = true;

  inputs.forEach((input) => {
    if (input.required && !input.value) {
      input.style.borderColor = '#c94a4a';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  document.querySelectorAll('.error-message').forEach(el => el.remove());

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailInput && !emailRegex.test(emailInput.value.trim())) {
    emailInput.style.borderColor = '#c94a4a';
    const emailError = document.createElement('small');
    emailError.className = 'error-message';
    emailError.style.color = '#c94a4a';
    emailError.textContent = 'Please enter a valid email address.';
    emailInput.parentElement.appendChild(emailError);
    isValid = false;
  }

  if (phoneInput) {
    const phoneValue = phoneInput.value.replace(/\D/g, '');
    if (phoneValue.length !== 10) {
      phoneInput.style.borderColor = '#c94a4a';
      const phoneError = document.createElement('small');
      phoneError.className = 'error-message';
      phoneError.style.color = '#c94a4a';
      phoneError.textContent = 'Phone number must contain exactly 10 digits.';
      phoneInput.parentElement.appendChild(phoneError);
      isValid = false;
    }
  }

  if (isValid) {
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Reservation Requested!';
    submitBtn.style.backgroundColor = '#4a9c6a';
    submitBtn.disabled = true;

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = '';
      submitBtn.disabled = false;
      updateAvailableTimes();
    }, 3000);
  }
}

// ── Intersection Observer ──────────────────────────────
function setupIntersectionObserver() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animatedElements = document.querySelectorAll('.about-content, .menu-panel, .reservation-form, .location-info');

  if (prefersReduced) {
    animatedElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { root: null, rootMargin: '0px', threshold: 0.1 }
  );

  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ── Auto-scroll on hero click ──────────────────────────
const heroScroll = document.querySelector('.hero-scroll');
let autoScrollInterval = null;

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    window.scrollBy({ top: 2, behavior: 'instant' });
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
      stopAutoScroll();
    }
  }, 15);
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

if (heroScroll) {
  heroScroll.style.cursor = 'pointer';
  heroScroll.addEventListener('click', () => {
    autoScrollInterval ? stopAutoScroll() : startAutoScroll();
  });
}

['mousemove', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach((event) => {
  window.addEventListener(event, stopAutoScroll);
});

// ── Back To Top ──────────────────────────────────────────
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    const past = window.scrollY > 300;
    backToTopBtn.style.display = past ? 'block' : 'none';
    backToTopBtn.classList.toggle('visible', past);
  });

  backToTopBtn.addEventListener('click', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
}

// ── Event Listeners ──────────────────────────────────────
window.addEventListener('scroll', handleScroll);
navToggle.addEventListener('click', toggleMobileMenu);

navLinks.forEach((link) => link.addEventListener('click', smoothScroll));

document.querySelectorAll('.nav-cta, .nav-cta-mobile, .hero-buttons a').forEach((link) => {
  link.addEventListener('click', smoothScroll);
});

if (reservationForm) {
  reservationForm.addEventListener('submit', handleFormSubmit);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMobileMenu();
});

// ── Reviews (localStorage) ──────────────────────────────
const STORAGE_KEY = 'lighthouse_reviews';

const pinnedReview = {
  name: 'Rasshi Srivastav',
  rating: 5,
  text: 'Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience — will definitely be coming back!',
  date: '14 May 2026',
};

function getReviews() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  const userReviews = getReviews();
  const allReviews = [pinnedReview, ...userReviews];

  grid.innerHTML = allReviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <p class="review-text">${r.text}</p>
        <div class="review-author">
          <div class="review-avatar">${r.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <span class="review-name">${r.name}</span>
            <span class="review-date">${r.date}</span>
          </div>
        </div>
      </div>`
    )
    .join('');
}

// ── Star rating widget ──────────────────────────────────
let selectedRating = 0;
const starBtns = document.querySelectorAll('#star-input .star-btn');

starBtns.forEach((btn) => {
  btn.addEventListener('mouseenter', () => {
    const val = +btn.dataset.value;
    starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= val));
  });
  btn.addEventListener('mouseleave', () => {
    starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= selectedRating));
  });
  btn.addEventListener('click', () => {
    selectedRating = +btn.dataset.value;
    document.getElementById('review-rating').value = selectedRating;
    starBtns.forEach((s) => s.classList.toggle('active', +s.dataset.value <= selectedRating));
  });
});

// ── Review validation ──────────────────────────────────
function isMeaningfulReview(text) {
  const words = text.trim().split(/\s+/);
  const randomPattern = /^(.)\1+$|^[a-zA-Z]{1,6}$/;
  if (randomPattern.test(text.trim())) return false;
  return words.length >= 3;
}

function isValidName(name) {
  return /^[A-Za-z\s'\-]{3,30}$/.test(name.trim());
}

const reviewForm = document.getElementById('review-form');
const reviewMsg = document.getElementById('review-msg');

if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('review-name').value.trim();
    const reviewText = document.getElementById('review-text').value.trim();

    reviewMsg.style.display = 'block';

    if (!selectedRating) {
      reviewMsg.textContent = 'Please select a star rating.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isValidName(name)) {
      reviewMsg.textContent = 'Name should contain only letters and be 3–30 characters long.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (reviewText.length < 20) {
      reviewMsg.textContent = 'Review must contain at least 20 characters.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }
    if (!isMeaningfulReview(reviewText)) {
      reviewMsg.textContent = 'Please enter a meaningful review.';
      reviewMsg.style.color = '#c94a4a';
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    const newReview = { id: Date.now(), name, rating: selectedRating, text: reviewText, date: dateStr };
    const reviews = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    reviewForm.reset();
    selectedRating = 0;
    document.getElementById('review-rating').value = 0;
    starBtns.forEach((s) => s.classList.remove('active'));

    reviewMsg.textContent = 'Review submitted successfully!';
    reviewMsg.style.color = '#4a9c6a';
    setTimeout(() => { reviewMsg.style.display = 'none'; }, 3000);
  });
}

// ── Veg / Non-Veg Filter ──────────────────────────────
(function () {
  const dietBtns = document.querySelectorAll('.diet-btn');
  if (!dietBtns.length) return;

  function applyDietFilter(diet) {
    const activePanels = document.querySelectorAll('.menu-panel.active');
    activePanels.forEach(panel => {
      const items = panel.querySelectorAll('.menu-item');
      let visibleCount = 0;

      items.forEach(item => {
        const itemDiet = item.dataset.diet || 'all';
        const show = diet === 'all' || itemDiet === diet;
        item.classList.toggle('diet-hidden', !show);
        if (show) visibleCount++;
      });

      let noResults = panel.querySelector('.diet-no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'diet-no-results';
        noResults.textContent = 'No items match the selected filter.';
        panel.querySelector('.menu-items').appendChild(noResults);
      }
      noResults.classList.toggle('visible', visibleCount === 0);
    });
  }

  dietBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dietBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyDietFilter(btn.dataset.diet);
    });
  });

  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const activeDiet = document.querySelector('.diet-btn.active')?.dataset.diet || 'all';
      setTimeout(() => applyDietFilter(activeDiet), 50);
    });
  });
})();

// ── Initialise ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  handleScroll();
  setupIntersectionObserver();
  updateAvailableTimes();
  renderReviews();
});

// ============================================
// SMART MEAL PAIRING ASSISTANT
// ============================================

// ── Pairing Data ────────────────────────────────────
const PAIRING_DATA = {
  "Masala Dosa": {
    cuisine: "South Indian",
    flavorProfile: ["Tangy", "Savory", "Light"],
    weight: "Light",
    season: "All",
    recommended: {
      appetizer: ["Sambar", "Coconut Chutney"],
      drink: ["Masala Chai", "Fresh Lime Soda"],
      dessert: ["Gulab Jamun", "Kulfi"]
    },
    alternatives: {
      appetizer: ["Tomato Soup", "Veg Cutlet"],
      drink: ["Mango Lassi", "Filter Coffee"],
      dessert: ["Rasmalai", "Ice Cream"]
    },
    avoid: {
      reason: "Too heavy",
      items: ["Butter Chicken", "Biryani"]
    },
    flavorNotes: {
      balance: "Add a spicy side for contrast",
      spiceLevel: "Mild"
    }
  },
  
  "Idli Sambar": {
    cuisine: "South Indian",
    flavorProfile: ["Mild", "Comforting", "Light"],
    weight: "Light",
    season: "All",
    recommended: {
      appetizer: ["Vada", "Coconut Chutney"],
      drink: ["Filter Coffee", "Masala Chai"],
      dessert: ["Kesari", "Kulfi"]
    },
    alternatives: {
      appetizer: ["Medu Vada", "Pongal"],
      drink: ["Fresh Lime Soda", "Badam Milk"],
      dessert: ["Gulab Jamun", "Rasmalai"]
    },
    avoid: {
      reason: "Overpowering flavors",
      items: ["Spicy Chicken Curry"]
    },
    flavorNotes: {
      balance: "Perfect light meal",
      spiceLevel: "Mild"
    }
  },
  
  "Chicken Keema Dosa": {
    cuisine: "Fusion",
    flavorProfile: ["Spicy", "Savory", "Hearty"],
    weight: "Medium",
    season: "All",
    recommended: {
      appetizer: ["Chicken 65", "Paneer Tikka"],
      drink: ["Mango Lassi", "Masala Chai"],
      dessert: ["Gulab Jamun", "Rasmalai"]
    },
    alternatives: {
      appetizer: ["Spring Rolls", "Fish Fry"],
      drink: ["Fresh Lime Soda", "Buttermilk"],
      dessert: ["Kulfi", "Ice Cream"]
    },
    avoid: {
      reason: "Too heavy together",
      items: ["Butter Chicken", "Biryani"]
    },
    flavorNotes: {
      balance: "Pair with a cooling drink",
      spiceLevel: "High"
    }
  },
  
  "Paneer Butter Masala": {
    cuisine: "North Indian",
    flavorProfile: ["Creamy", "Rich", "Mild Spicy"],
    weight: "Heavy",
    season: "Winter",
    recommended: {
      appetizer: ["Paneer Tikka", "Mushroom"],
      drink: ["Mango Lassi", "Masala Chai"],
      dessert: ["Gulab Jamun", "Rasmalai"]
    },
    alternatives: {
      appetizer: ["Spring Rolls", "Hara Bhara Kebab"],
      drink: ["Fresh Lime Soda", "Buttermilk"],
      dessert: ["Kulfi", "Ice Cream"]
    },
    avoid: {
      reason: "Too heavy together",
      items: ["Butter Chicken", "Biryani"]
    },
    flavorNotes: {
      balance: "Pair with naan for best experience",
      spiceLevel: "Medium"
    }
  },
  
  "Hyderabadi Chicken Biryani": {
    cuisine: "North Indian",
    flavorProfile: ["Spicy", "Aromatic", "Rich"],
    weight: "Heavy",
    season: "All",
    recommended: {
      appetizer: ["Paneer Tikka", "Chicken 65"],
      drink: ["Mango Lassi", "Masala Chai"],
      dessert: ["Gulab Jamun", "Rasmalai"]
    },
    alternatives: {
      appetizer: ["Spring Rolls", "Fish Fry"],
      drink: ["Fresh Lime Soda", "Buttermilk"],
      dessert: ["Kulfi", "Ice Cream"]
    },
    avoid: {
      reason: "Too heavy together",
      items: ["Butter Chicken", "Fish Curry"]
    },
    flavorNotes: {
      balance: "Add raita for cooling effect",
      spiceLevel: "High"
    }
  },
  
  "Butter Chicken": {
    cuisine: "North Indian",
    flavorProfile: ["Creamy", "Rich", "Mild Spicy"],
    weight: "Heavy",
    season: "Winter",
    recommended: {
      appetizer: ["Paneer Tikka", "Chicken 65"],
      drink: ["Mango Lassi", "Masala Chai"],
      dessert: ["Gulab Jamun", "Rasmalai"]
    },
    alternatives: {
      appetizer: ["Spring Rolls", "Mushroom"],
      drink: ["Fresh Lime Soda", "Buttermilk"],
      dessert: ["Kulfi", "Ice Cream"]
    },
    avoid: {
      reason: "Too heavy together",
      items: ["Biryani", "Fish Curry"]
    },
    flavorNotes: {
      balance: "Pair with butter naan",
      spiceLevel: "Medium"
    }
  },
  
  "Mango Lassi": {
    cuisine: "North Indian",
    flavorProfile: ["Sweet", "Creamy", "Cooling"],
    weight: "Light",
    season: "Summer",
    recommended: {},
    alternatives: {},
    avoid: {
      reason: "Already a drink",
      items: []
    },
    flavorNotes: {
      balance: "Perfect cooling drink",
      spiceLevel: "None"
    }
  },
  
  "Masala Chai": {
    cuisine: "Indian",
    flavorProfile: ["Spiced", "Warm", "Sweet"],
    weight: "Light",
    season: "Winter",
    recommended: {},
    alternatives: {},
    avoid: {
      reason: "Already a drink",
      items: []
    },
    flavorNotes: {
      balance: "Perfect for cold weather",
      spiceLevel: "None"
    }
  },
  
  "Fresh Lime Soda": {
    cuisine: "Indian",
    flavorProfile: ["Tangy", "Refreshing", "Light"],
    weight: "Light",
    season: "Summer",
    recommended: {},
    alternatives: {},
    avoid: {
      reason: "Already a drink",
      items: []
    },
    flavorNotes: {
      balance: "Great with spicy food",
      spiceLevel: "None"
    }
  },
  
  "Gulab Jamun": {
    cuisine: "Indian",
    flavorProfile: ["Sweet", "Rich", "Indulgent"],
    weight: "Medium",
    season: "All",
    recommended: {},
    alternatives: {},
    avoid: {
      reason: "Already a dessert",
      items: []
    },
    flavorNotes: {
      balance: "Best served warm",
      spiceLevel: "None"
    }
  },
  
  "Rasmalai": {
    cuisine: "Indian",
    flavorProfile: ["Sweet", "Creamy", "Light"],
    weight: "Light",
    season: "All",
    recommended: {},
    alternatives: {},
    avoid: {
      reason: "Already a dessert",
      items: []
    },
    flavorNotes: {
      balance: "Light and refreshing",
      spiceLevel: "None"
    }
  },
  
  "Kulfi": {
    cuisine: "Indian",
    flavorProfile: ["Sweet", "Creamy", "Cold"],
    weight: "Light",
    season: "Summer",
    recommended: {},
    alternatives: {},
    avoid: {
      reason: "Already a dessert",
      items: []
    },
    flavorNotes: {
      balance: "Great summer dessert",
      spiceLevel: "None"
    }
  }
};




// ── Pairing Engine ────────────────────────────────────
class MealPairingEngine {
  constructor() {
    this.selectedMain = null;
    this.selectedItems = {
      appetizer: null,
      drink: null,
      dessert: null
    };
    this.mealItems = [];
  }

  selectMain(dishName) {
    this.selectedMain = dishName;
    this.selectedItems = { appetizer: null, drink: null, dessert: null };
    this.mealItems = [dishName];
    return this.getPairings(dishName);
  }

  getPairings(dishName) {
    const data = PAIRING_DATA[dishName];
    if (!data) return null;

    const pairings = {
      recommended: data.recommended || {},
      alternatives: data.alternatives || {},
      avoid: data.avoid || {},
      flavorNotes: data.flavorNotes || {},
      cuisine: data.cuisine || "",
      weight: data.weight || "",
      season: data.season || ""
    };

    return pairings;
  }

  addItem(category, itemName, price) {
    if (category === 'main') {
      this.selectedMain = itemName;
      this.mealItems = [itemName];
    } else {
      // Remove existing item in same category
      if (this.selectedItems[category]) {
        const index = this.mealItems.indexOf(this.selectedItems[category]);
        if (index > -1) this.mealItems.splice(index, 1);
      }
      this.selectedItems[category] = itemName;
      this.mealItems.push(itemName);
    }
    return this.calculateTotal();
  }

  removeItem(category) {
    if (this.selectedItems[category]) {
      const index = this.mealItems.indexOf(this.selectedItems[category]);
      if (index > -1) this.mealItems.splice(index, 1);
      this.selectedItems[category] = null;
    }
    return this.calculateTotal();
  }

  calculateTotal() {
    let total = 0;
    if (this.selectedMain) {
      const mainPrice = this.getDishPrice(this.selectedMain);
      total += mainPrice;
    }
    for (const category of ['appetizer', 'drink', 'dessert']) {
      if (this.selectedItems[category]) {
        const price = this.getDishPrice(this.selectedItems[category]);
        total += price;
      }
    }
    return total;
  }

  getDishPrice(dishName) {
    const menuItems = document.querySelectorAll('.menu-item');
    for (const item of menuItems) {
      const h3 = item.querySelector('h3');
      const priceSpan = item.querySelector('.menu-price');
      if (h3 && priceSpan && h3.textContent.trim() === dishName) {
        return parseInt(priceSpan.textContent.replace(/[₹,]/g, '')) || 0;
      }
    }
    const fallbackPrices = {
      'Masala Dosa': 180, 'Idli Sambar': 120, 'Chicken Keema Dosa': 240,
      'Paneer Butter Masala': 280, 'Hyderabadi Chicken Biryani': 320,
      'Butter Chicken': 340, 'Gulab Jamun': 120, 'Rasmalai': 140,
      'Kulfi': 130, 'Mango Lassi': 110, 'Masala Chai': 70,
      'Fresh Lime Soda': 90
    };
    return fallbackPrices[dishName] || 0;
  }

  getCompatibilityScore() {
    const totalItems = this.mealItems.length;
    if (totalItems <= 1) return { stars: 1, text: 'Add more items for a balanced meal!' };
    if (totalItems === 2) return { stars: 2, text: 'Good start! Add a drink or dessert.' };
    if (totalItems === 3) return { stars: 3, text: 'Nice balance! One more item for perfection.' };
    if (totalItems === 4) return { stars: 4, text: 'Great meal! Almost perfect balance.' };
    if (totalItems >= 5) return { stars: 5, text: '⭐⭐⭐⭐⭐ Perfect balance! A complete feast!' };
    return { stars: 0, text: 'Select a main dish to begin.' };
  }

  getRandomSurprise() {
    const dishes = Object.keys(PAIRING_DATA);
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    const pairings = this.getPairings(randomDish);
    
    const result = {
      main: randomDish,
      pairings: {
        appetizer: null,
        drink: null,
        dessert: null
      }
    };

    if (pairings && pairings.recommended) {
      const categories = ['appetizer', 'drink', 'dessert'];
      for (const cat of categories) {
        if (pairings.recommended[cat] && pairings.recommended[cat].length > 0) {
          const options = pairings.recommended[cat];
          result.pairings[cat] = options[Math.floor(Math.random() * options.length)];
        }
      }
    }
    return result;
  }
}

// ── UI Controller ──────────────────────────────────
class PairingUIController {
  constructor() {
    this.engine = new MealPairingEngine();
    this.panel = document.getElementById('pairingPanel');
    this.overlay = document.getElementById('pairingOverlay');
    this.pairingGrid = document.getElementById('pairingGrid');
    this.pairingAlternatives = document.getElementById('pairingAlternatives');
    this.selectedDishName = document.getElementById('selectedDishName');
    this.selectedDishPrice = document.getElementById('selectedDishPrice');
    this.summaryCount = document.getElementById('summaryCount');
    this.summaryTotal = document.getElementById('summaryTotal');
    this.scoreStars = document.getElementById('scoreStars');
    this.scoreText = document.getElementById('scoreText');

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('pairingClose').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.close();
      }
    });

    document.querySelectorAll('.pairing-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dishName = btn.dataset.dish;
        const price = btn.dataset.price;
        this.open(dishName, price);
      });
    });

    document.getElementById('surpriseMeBtn').addEventListener('click', () => this.surpriseMe());
    document.getElementById('resetPairingBtn').addEventListener('click', () => this.reset());
    document.getElementById('reserveMealBtn').addEventListener('click', () => this.reserveMeal());
    document.getElementById('saveMealBtn').addEventListener('click', () => this.saveMeal());
  }

  open(dishName, price) {
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.loadPairings(dishName, price);
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  loadPairings(dishName, price) {
    const pairings = this.engine.selectMain(dishName);
    this.selectedDishName.textContent = dishName;
    this.selectedDishPrice.textContent = `₹${price}`;

    if (!pairings) {
      this.showEmptyState();
      return;
    }

    this.renderRecommended(pairings.recommended);
    this.renderAlternatives(pairings.alternatives);
    this.updateSummary();
    this.updateScore();
  }

  renderRecommended(recommended) {
    if (!recommended || Object.keys(recommended).length === 0) {
      this.pairingGrid.innerHTML = `
        <div class="pairing-empty">
          <span class="pairing-empty-icon">🍽️</span>
          <p>This dish is perfect on its own!</p>
        </div>
      `;
      return;
    }

    const categories = {
      appetizer: '🍽️ Appetizer',
      drink: '🥤 Drink',
      dessert: '🍮 Dessert'
    };

    let html = '';
    for (const [cat, items] of Object.entries(recommended)) {
      if (items && items.length > 0) {
        const displayName = categories[cat] || cat;
        html += `
          <div class="pairing-item" data-category="${cat}" data-item="${items[0]}">
            <div class="pairing-item-info">
              <span class="pairing-item-name">${displayName}: ${items[0]}</span>
              <span class="pairing-item-desc">✨ Perfect match</span>
            </div>
            <span class="pairing-item-badge badge-perfect">Perfect</span>
            <span class="pairing-item-price">₹${this.engine.getDishPrice(items[0])}</span>
          </div>
        `;
      }
    }

    this.pairingGrid.innerHTML = html;

    this.pairingGrid.querySelectorAll('.pairing-item').forEach(el => {
      el.addEventListener('click', () => {
        const category = el.dataset.category;
        const itemName = el.dataset.item;
        this.selectPairing(category, itemName, el);
      });
    });
  }

  renderAlternatives(alternatives) {
    if (!alternatives || Object.keys(alternatives).length === 0) {
      this.pairingAlternatives.innerHTML = `
        <div class="pairing-empty" style="grid-column: 1 / -1;">
          <p>No alternatives available</p>
        </div>
      `;
      return;
    }

    let html = '';
    for (const [cat, items] of Object.entries(alternatives)) {
      if (items && items.length > 0) {
        const displayNames = {
          appetizer: '🍽️',
          drink: '🥤',
          dessert: '🍮'
        };
        const icon = displayNames[cat] || '📌';
        html += `
          <div class="pairing-alt-item" data-category="${cat}" data-item="${items[0]}">
            <div class="pairing-alt-name">${icon} ${items[0]}</div>
            <div class="pairing-alt-price">₹${this.engine.getDishPrice(items[0])}</div>
          </div>
        `;
      }
    }

    this.pairingAlternatives.innerHTML = html;

    this.pairingAlternatives.querySelectorAll('.pairing-alt-item').forEach(el => {
      el.addEventListener('click', () => {
        const category = el.dataset.category;
        const itemName = el.dataset.item;
        this.selectPairing(category, itemName, el);
      });
    });
  }

  selectPairing(category, itemName, element) {
    const siblings = element.parentElement.querySelectorAll('.selected');
    siblings.forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');

    this.engine.addItem(category, itemName, this.engine.getDishPrice(itemName));
    this.updateSummary();
    this.updateScore();
  }

  updateSummary() {
    const count = this.engine.mealItems.length;
    const total = this.engine.calculateTotal();
    this.summaryCount.textContent = `${count} items`;
    this.summaryTotal.textContent = `₹${total}`;
  }

  updateScore() {
    const score = this.engine.getCompatibilityScore();
    this.scoreStars.textContent = '★'.repeat(score.stars) + '☆'.repeat(5 - score.stars);
    this.scoreText.textContent = score.text;
  }

  showEmptyState() {
    this.pairingGrid.innerHTML = `
      <div class="pairing-empty">
        <span class="pairing-empty-icon">🔍</span>
        <p>No pairing data available for this dish yet.</p>
      </div>
    `;
    this.pairingAlternatives.innerHTML = '';
  }

  surpriseMe() {
    const surprise = this.engine.getRandomSurprise();
    const price = this.engine.getDishPrice(surprise.main);
    this.loadPairings(surprise.main, price);

    setTimeout(() => {
      for (const [cat, item] of Object.entries(surprise.pairings)) {
        if (item) {
          const altItems = this.pairingAlternatives.querySelectorAll('.pairing-alt-item');
          const recommendItems = this.pairingGrid.querySelectorAll('.pairing-item');
          
          let found = false;
          recommendItems.forEach(el => {
            if (el.dataset.category === cat && el.dataset.item === item) {
              this.selectPairing(cat, item, el);
              found = true;
            }
          });

          if (!found) {
            altItems.forEach(el => {
              if (el.dataset.category === cat && el.dataset.item === item) {
                this.selectPairing(cat, item, el);
              }
            });
          }
        }
      }
    }, 300);
  }

  reset() {
    const main = this.engine.selectedMain;
    if (main) {
      const price = this.engine.getDishPrice(main);
      this.loadPairings(main, price);
    } else {
      this.selectedDishName.textContent = 'No dish selected';
      this.selectedDishPrice.textContent = '';
      this.pairingGrid.innerHTML = '';
      this.pairingAlternatives.innerHTML = '';
      this.updateSummary();
      this.updateScore();
    }
  }

  reserveMeal() {
    const items = this.engine.mealItems;
    if (items.length === 0) {
      alert('Please select at least one dish first!');
      return;
    }
    alert(`🍽️ Your Meal:\n${items.join('\n')}\n\nTotal: ₹${this.engine.calculateTotal()}\n\nProceed to reservation?`);
  }

  saveMeal() {
    const items = this.engine.mealItems;
    if (items.length === 0) {
      alert('Please select at least one dish first!');
      return;
    }
    const savedMeals = JSON.parse(localStorage.getItem('savedMeals') || '[]');
    savedMeals.push({
      date: new Date().toISOString(),
      items: items,
      total: this.engine.calculateTotal()
    });
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
    alert('✅ Meal saved to favorites!');
  }
}

// ── Initialize Pairing Controller ──────────────────
let pairingController;

document.addEventListener('DOMContentLoaded', () => {
  pairingController = new PairingUIController();
});