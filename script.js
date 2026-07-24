document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const toggleAuthBtn = document.getElementById('toggleAuthBtn');
  const toggleText = document.getElementById('toggleText');

  let isSignUpMode = false; // Starts in Login mode

  // Switch between Log In and Sign Up modes
  toggleAuthBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;

    // Hide error messages when toggling mode
    document.getElementById('authEmailError').style.display = 'none';
    document.getElementById('authPasswordError').style.display = 'none';

    if (isSignUpMode) {
      modalTitle.textContent = "Create Account";
      modalSubtitle.textContent = "Join our food bank rescue network";
      authSubmitBtn.textContent = "Sign Up";
      toggleText.textContent = "Already have an account?";
      toggleAuthBtn.textContent = "Log In";
    } else {
      modalTitle.textContent = "Food Rescue";
      modalSubtitle.textContent = "Log in to manage community food donations";
      authSubmitBtn.textContent = "Log In";
      toggleText.textContent = "Don't have an account?";
      toggleAuthBtn.textContent = "Sign Up";
    }
  });

  // Handle Form Submit
  authForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents page reload

    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const emailError = document.getElementById('authEmailError');
    const passwordError = document.getElementById('authPasswordError');

    let isValid = true;

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.style.display = 'block';
      isValid = false;
    } else {
      emailError.style.display = 'none';
    }

    // Password validation
    if (password.length < 6) {
      passwordError.style.display = 'block';
      isValid = false;
    } else {
      passwordError.style.display = 'none';
    }

    if (!isValid) return;

    // Retrieve registered users from LocalStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    if (isSignUpMode) {
      // --- SIGN UP LOGIC ---
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        alert('An account with this email already exists. Please log in.');
        return;
      }

      users.push({ email, password });
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      localStorage.setItem('currentUser', email);

      alert('Account created successfully! Welcome to Food Rescue.');
      window.location.href = 'index.html';

    } else {
      // --- LOG IN LOGIC ---
      const userMatch = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (userMatch) {
        localStorage.setItem('currentUser', email);
        alert('Logged in successfully!');
        window.location.href = 'index.html';
      } else {
        alert('Incorrect email or password. Please try again or click "Sign Up" first.');
      }
    }
  });
});

// --- Global Navbar & LocalStorage Management ---
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  const navAuthBtn = document.getElementById('navAuthBtn');
  const userInfo = document.getElementById('userInfo');

  // Display user state in navbar
  if (currentUser && navAuthBtn) {
    navAuthBtn.textContent = 'Logout';
    navAuthBtn.href = '#';
    navAuthBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      alert('Logged out successfully.');
      window.location.href = 'login.html';
    });
  }

  // Handle Donation Form submission
  const donationForm = document.getElementById('donationForm');
  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const foodType = document.getElementById('foodType').value;
      const quantity = parseInt(document.getElementById('quantity').value, 10);
      const pantry = document.getElementById('pantrySelect').value;

      if (!foodType || !quantity || !pantry) {
        alert('Please fill in all fields.');
        return;
      }

      const donations = JSON.parse(localStorage.getItem('donations') || '[]');
      donations.push({ foodType, quantity, pantry, date: new Date().toLocaleDateString() });
      localStorage.setItem('donations', JSON.stringify(donations));

      alert('Donation submitted successfully!');
      donationForm.reset();
    });
  }

  // Update Impact Counter on Home Page
  const totalMealsEl = document.getElementById('totalMeals');
  const totalDonationsEl = document.getElementById('totalDonations');
  if (totalMealsEl && totalDonationsEl) {
    const donations = JSON.parse(localStorage.getItem('donations') || '[]');
    const totalQty = donations.reduce((sum, item) => sum + item.quantity, 0);
    
    totalMealsEl.textContent = totalQty;
    totalDonationsEl.textContent = donations.length;
  }
});