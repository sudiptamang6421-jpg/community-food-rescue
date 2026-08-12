document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. INITIALIZE FOOD DATA WITH LOCALSTORAGE
  // ==========================================
  const defaultFoodItems = [
    {
      id: 1,
      title: 'Fresh Baguettes & Pastries',
      category: 'Bakery',
      location: 'Central Bakery & Cafe',
      quantity: '8 portions',
      badge: 'Pickup Today'
    },
    {
      id: 2,
      title: 'Surplus Organic Vegetables',
      category: 'Vegetables',
      location: 'Green Market Store',
      quantity: '12 kg',
      badge: 'Urgent'
    },
    {
      id: 3,
      title: 'Unsold Lunch Buffet Bowls',
      category: 'Prepared',
      location: 'Campus Bistro',
      quantity: '5 meals',
      badge: 'Hot Food'
    },
    {
      id: 4,
      title: 'Artisan Sourdough Loaves',
      category: 'Bakery',
      location: 'Corner Bakery',
      quantity: '4 loaves',
      badge: 'Fresh'
    }
  ];

  // Load items from localStorage if available, or fall back to defaults
  let storedItems = localStorage.getItem('feastForwardItems');
  let foodItems = storedItems ? JSON.parse(storedItems) : defaultFoodItems;

  // Save current array to localStorage
  function saveFoodItems() {
    localStorage.setItem('feastForwardItems', JSON.stringify(foodItems));
  }

  // System Stats
  let mealsRescuedCount = parseInt(localStorage.getItem('mealsRescuedCount')) || 0;

  // ==========================================
  // 2. RENDER FOOD CARDS & UPDATE STATS
  // ==========================================
  const cardsContainer = document.getElementById('foodCardsContainer');
  const totalMealsEl = document.getElementById('totalMeals');
  const totalDonationsEl = document.getElementById('totalDonations');

  function updateStats() {
    if (totalMealsEl) totalMealsEl.textContent = mealsRescuedCount;
    if (totalDonationsEl) totalDonationsEl.textContent = foodItems.length;
  }

  function renderCards(filterCategory = 'all') {
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';

    const filtered = filterCategory === 'all' 
      ? foodItems 
      : foodItems.filter(item => item.category.toLowerCase() === filterCategory.toLowerCase());

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">No items available in this category.</p>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'food-card';
      card.innerHTML = `
        ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
        <div class="card-body">
          <span class="card-category">${item.category}</span>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-location">📍 ${item.location}</p>
          <div class="card-footer">
            <span class="card-qty">📦 ${item.quantity}</span>
            <button class="claim-btn" data-id="${item.id}">Reserve</button>
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    // Attach Reserve Click Handlers
    $('.claim-btn').on('click', function(e) {
    const itemId = parseInt($(this).data('id'));
        const itemIndex = foodItems.findIndex(i => i.id === itemId);

        if (itemIndex !== -1) {
          const reservedItem = foodItems[itemIndex];
          
          alert(`🎉 Success! You have reserved "${reservedItem.title}" from ${reservedItem.location}. Check your email for pickup details.`);
          
          // Remove reserved item and increase meals rescued
          foodItems.splice(itemIndex, 1);
          mealsRescuedCount += 1;
          
          // Persist changes
          saveFoodItems();
          localStorage.setItem('mealsRescuedCount', mealsRescuedCount);
          
          updateStats();
          renderCards(filterCategory);
        }
      });
    }
    

  // Initial call on page load
  renderCards();
  updateStats();

  // ==========================================
  // 3. CATEGORY FILTER BUTTONS
  // ==========================================
  $('.filter-btn').on('click', function() {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');
    const filterValue = $(this).data('filter');
    renderCards(filterValue);
});

  // ==========================================
  // 4. DONATE FORM HANDLER (WORKS ON BOTH INDEX & DONATE PAGE)
  // ==========================================
  const donateForm = document.getElementById('donateForm') || 
                     document.getElementById('donationForm') || 
                     document.getElementById('addFoodForm');

  if (donateForm) {
    donateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve input elements (with fallback IDs)
      const titleInput = document.getElementById('donateTitle') || document.getElementById('foodTitle') || document.getElementById('title');
      const categoryInput = document.getElementById('donateCategory') || document.getElementById('foodCategory') || document.getElementById('category');
      const locationInput = document.getElementById('donateLocation') || document.getElementById('foodLocation') || document.getElementById('location');
      const quantityInput = document.getElementById('donateQuantity') || document.getElementById('foodQuantity') || document.getElementById('quantity');

      const itemTitle = titleInput ? titleInput.value.trim() : "Surplus Meal Rescue";
      const itemCategory = categoryInput ? categoryInput.value : "Bakery";
      const itemLocation = locationInput ? locationInput.value.trim() : "Local Donor";
      const itemQuantity = quantityInput ? quantityInput.value.trim() : "1 portion";

      const newDonation = {
        id: Date.now(),
        title: itemTitle,
        category: itemCategory,
        location: itemLocation,
        quantity: itemQuantity,
        badge: 'Fresh'
      };

      // Add new donation to global array and save to local Storage
      foodItems.push(newDonation);
      saveFoodItems();

      // Update index page elements if user is currently on index
      renderCards('all');
      updateStats();

      alert(`🎉 Thank you! Your donation "${newDonation.title}" has been added.`);
      donateForm.reset();

      // If user submits form from donate.html, redirect back to home page to see new item
      if (window.location.pathname.includes('donate.html')) {
        window.location.href = 'index.html';
      }

      // Hide modal if modal exists
      const donateModal = document.getElementById('donateModal') || document.getElementById('donationModal');
      if (donateModal) {
        donateModal.classList.add('hidden');
        donateModal.style.display = 'none';
      }
    });
  }

  // Check if a brand-new donation alert flag exists
  if (localStorage.getItem('donationAddedSuccess')) {
    alert("🎉 Success! Your new donation has been listed under Active Donations.");
    localStorage.removeItem('donationAddedSuccess');
  }

  // ==========================================
  // 5. AUTHENTICATION (LOGIN & SIGN UP)
  // ==========================================
  const authForm = document.getElementById('authForm');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const toggleAuthBtn = document.getElementById('toggleAuthBtn');
  const toggleText = document.getElementById('toggleText');

  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');

  let isSignUpMode = false;

  // Fill Saved Login Credentials
  if (emailInput && passwordInput && rememberMeCheckbox) {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedEmail && savedPassword) {
      emailInput.value = savedEmail;
      passwordInput.value = savedPassword;
      rememberMeCheckbox.checked = true;
    }
  }

  // Password Visibility Toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Toggle Mode (Login <-> Sign Up)
  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;

      if (isSignUpMode) {
        if (modalSubtitle) modalSubtitle.textContent = "Create an account to donate & rescue surplus food";
        if (authSubmitBtn) authSubmitBtn.textContent = "Sign Up";
        if (toggleText) toggleText.textContent = "Already have an account?";
        if (toggleAuthBtn) toggleAuthBtn.textContent = "Log In";
      } else {
        if (modalSubtitle) modalSubtitle.textContent = "Log in to manage community food donations";
        if (authSubmitBtn) authSubmitBtn.textContent = "Log In";
        if (toggleText) toggleText.textContent = "Don't have an account?";
        if (toggleAuthBtn) toggleAuthBtn.textContent = "Sign Up";
      }
    });
  }

  // Form Submit Handler
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || password.length < 6) {
        alert("⚠️ Please enter a valid email address and a password with at least 6 characters.");
        return;
      }

      // Remember Me logic
      if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Create Active User State
      const userData = { email: email, name: email.split('@')[0] };
      localStorage.setItem('activeUser', JSON.stringify(userData));

      if (isSignUpMode) {
        alert("🎉 Account successfully created! Welcome to FeastForward.");
      } else {
        alert("✅ Welcome back! You are now logged in.");
      }

      window.location.href = 'index.html';
    });
  }

  // ==========================================
  // 6. NAVBAR STATE & LOGOUT
  // ==========================================
  const navAuthBtn = document.getElementById('navAuthBtn');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const profileDropdownBtn = document.getElementById('profileDropdownBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  const dropdownNameEl = document.getElementById('dropdownName');
  const dropdownEmailEl = document.getElementById('dropdownEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  function syncAuthState() {
    const activeUserRaw = localStorage.getItem('activeUser');
    if (activeUserRaw) {
      const activeUser = JSON.parse(activeUserRaw);

      if (navAuthBtn) navAuthBtn.classList.add('hidden');
      if (userProfileMenu) userProfileMenu.classList.remove('hidden');

      const displayName = activeUser.name || activeUser.email.split('@')[0];
      if (userNameEl) userNameEl.textContent = displayName;
      if (userAvatarEl) userAvatarEl.textContent = displayName.charAt(0).toUpperCase();
      if (dropdownNameEl) dropdownNameEl.textContent = displayName;
      if (dropdownEmailEl) dropdownEmailEl.textContent = activeUser.email;
    } else {
      if (navAuthBtn) navAuthBtn.classList.remove('hidden');
      if (userProfileMenu) userProfileMenu.classList.add('hidden');
    }
  }

  syncAuthState();

  if (profileDropdownBtn && profileDropdown) {
    profileDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      profileDropdown.classList.add('hidden');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('activeUser');
      alert("👋 You have been logged out.");
      syncAuthState();
      window.location.href = 'index.html';
    });
  }
});