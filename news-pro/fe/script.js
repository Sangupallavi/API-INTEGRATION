const BASE_URL = 'http://localhost:5000/api';

const authSection = document.getElementById('auth-section');
const newsSection = document.getElementById('news-section');

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const createNewsForm = document.getElementById('create-news-form');

const newsList = document.getElementById('news-list');
const authMessage = document.getElementById('auth-message');

const userNameDisplay = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null; // Store logged in user info

// Show message helper
function showMessage(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? 'tomato' : '#f0d86b';
  setTimeout(() => (el.textContent = ''), 4000);
}

// Render user info in navbar
function updateUserUI() {
  if (currentUser) {
    userNameDisplay.textContent = `Hello, ${currentUser.name}`;
    userNameDisplay.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    authSection.classList.add('hidden');
    newsSection.classList.remove('hidden');
    fetchNews();
  } else {
    userNameDisplay.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    authSection.classList.remove('hidden');
    newsSection.classList.add('hidden');
  }
}

// Signup handler
signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    showMessage(authMessage, 'Please fill all fields', true);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Signup failed');
    showMessage(authMessage, 'Signup successful! Please login.');
    signupForm.reset();
  } catch (err) {
    showMessage(authMessage, err.message, true);
  }
});

// Login handler
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showMessage(authMessage, 'Please fill all fields', true);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');
    currentUser = data.user;
    updateUserUI();
    loginForm.reset();
    showMessage(authMessage, 'Login successful!');
  } catch (err) {
    showMessage(authMessage, err.message, true);
  }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  updateUserUI();
});

// Fetch all news
async function fetchNews() {
  newsList.innerHTML = 'Loading news...';
  try {
    const res = await fetch(`${BASE_URL}/news`);
    const newsArray = await res.json();

    if (!Array.isArray(newsArray)) {
      newsList.innerHTML = '<li>Error loading news</li>';
      return;
    }

    if (newsArray.length === 0) {
      newsList.innerHTML = '<li>No news yet</li>';
      return;
    }

    newsList.innerHTML = '';
    newsArray.forEach(item => {
      const li = document.createElement('li');
      li.className = 'news-item';
      li.innerHTML = `
        <h4>${item.title}</h4>
        <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
        <p>${item.content}</p>
        <div class="news-actions">
          <button class="edit-btn" data-id="${item._id}">Edit</button>
          <button class="delete-btn" data-id="${item._id}">Delete</button>
        </div>
      `;
      newsList.appendChild(li);
    });

    // Attach event listeners for edit and delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.dataset.id;
        if (confirm('Delete this news?')) {
          try {
            const res = await fetch(`${BASE_URL}/news/${id}`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.message || 'Deleted');
            fetchNews();
          } catch (err) {
            alert('Delete failed');
          }
        }
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.dataset.id;
        const item = newsArray.find(n => n._id === id);
        if (!item) return;
        // Prefill form with news to edit
        document.getElementById('news-title').value = item.title;
        document.getElementById('news-description').value = item.description;
        document.getElementById('news-content').value = item.content;
        createNewsForm.dataset.editId = id;
      });
    });
  } catch (err) {
    newsList.innerHTML = '<li>Error loading news</li>';
  }
}

// Create or update news handler
createNewsForm.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('news-title').value.trim();
  const description = document.getElementById('news-description').value.trim();
  const content = document.getElementById('news-content').value.trim();

  if (!title || !content) {
    alert('Title and content are required');
    return;
  }

  const payload = { title, description, content };

  try {
    let res;
    if (createNewsForm.dataset.editId) {
      // update
      const id = createNewsForm.dataset.editId;
      res = await fetch(`${BASE_URL}/news/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      delete createNewsForm.dataset.editId;
    } else {
      // create
      res = await fetch(`${BASE_URL}/news`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed');

    createNewsForm.reset();
    fetchNews();
    alert(createNewsForm.dataset.editId ? 'News updated' : 'News created');
  } catch (err) {
    alert(err.message);
  }
});

// Initialize UI
updateUserUI();
