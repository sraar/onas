// --- Dark Mode Toggle ---
const toggleSwitch = document.getElementById('dark-mode-toggle');
if (toggleSwitch) {
  toggleSwitch.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

// --- User Data in localStorage ---
const demoUsers = [
  { username: 'student1', password: 'pass123', role: 'student' },
  { username: 'teacher1', password: 'teach123', role: 'teacher' },
  { username: 'student2', password: 'pass234', role: 'student' },
];

// Load users or set demo users if none exist
function loadUsers() {
  const usersJSON = localStorage.getItem('users');
  if (!usersJSON) {
    localStorage.setItem('users', JSON.stringify(demoUsers));
    return demoUsers;
  }
  return JSON.parse(usersJSON);
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Load registration requests or empty
function loadRequests() {
  const reqJSON = localStorage.getItem('registrationRequests');
  if (!reqJSON) return [];
  return JSON.parse(reqJSON);
}

function saveRequests(requests) {
  localStorage.setItem('registrationRequests', JSON.stringify(requests));
}

// --- Login Logic ---
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    // Admin login check
    if (username === 'ONESMOS' && password === '266234300') {
      alert('Admin login successful!');
      window.location.href = 'admin.html';
      return;
    }

    // Check users list
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      alert(`Welcome ${user.role}!`);
      if (user.role === 'student') {
        window.location.href = 'student/dashboard.html';
      } else if (user.role === 'teacher') {
        window.location.href = 'teacher/dashboard.html';
      } else {
        alert('Role not recognized.');
      }
    } else {
      alert('Invalid credentials or user not approved yet.');
    }
  });
}

// --- Registration Logic ---
if (document.getElementById('registerForm')) {
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', e => {
    e.preventDefault();

    const fullname = registerForm.fullname.value.trim();
    const email = registerForm.email.value.trim();
    const role = registerForm.role.value;
    const desiredUsername = registerForm.desiredUsername.value.trim();
    const desiredPassword = registerForm.desiredPassword.value.trim();

    // Load existing users to check duplicates
    const users = loadUsers();
    if (users.some(u => u.username === desiredUsername)) {
      alert('Username already exists. Please choose another.');
      return;
    }

    // Load requests to check duplicates
    const requests = loadRequests();
    if (requests.some(r => r.desiredUsername === desiredUsername)) {
      alert('There is already a pending request with this username.');
      return;
    }

    // Add request
    requests.push({ fullname, email, role, desiredUsername, desiredPassword });
    saveRequests(requests);

    alert('Registration request submitted. Please wait for admin approval.');
    registerForm.reset();
  });
}

// --- Admin Page Logic ---
if (document.getElementById('requestsTable')) {
  const requestsTableBody = document.querySelector('#requestsTable tbody');
  const usersTableBody = document.querySelector('#usersTable tbody');

  // Load and display requests
  function displayRequests() {
    const requests = loadRequests();
    requestsTableBody.innerHTML = '';
    if (requests.length === 0) {
      requestsTableBody.innerHTML = '<tr><td colspan="6">No pending requests.</td></tr>';
      return;
    }
    requests.forEach((req, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${req.fullname}</td>
        <td>${req.email}</td>
        <td>${req.role}</td>
        <td>${req.desiredUsername}</td>
        <td><button class="approve-btn" data-index="${index}">Approve</button></td>
        <td><button class="reject-btn" data-index="${index}">Reject</button></td>
      `;
      requestsTableBody.appendChild(tr);
    });
  }

  // Load and display users
  function displayUsers() {
    const users = loadUsers();
    usersTableBody.innerHTML = '';
    if (users.length === 0) {
      usersTableBody.innerHTML = '<tr><td colspan="3">No users found.</td></tr>';
      return;
    }
    users.forEach((user, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td>
          <input type="password" placeholder="New password" class="reset-input" id="resetPass-${index}" />
          <button class="reset-btn" data-index="${index}">Reset</button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });
  }

  // Approve request
  requestsTableBody.addEventListener('click', e => {
    if (e.target.classList.contains('approve-btn')) {
      const index = e.target.dataset.index;
      const requests = loadRequests();
      const users = loadUsers();
      const approvedUser = requests.splice(index, 1)[0];
      users.push({
        username: approvedUser.desiredUsername,
        password: approvedUser.desiredPassword,
        role: approvedUser.role,
      });
      saveUsers(users);
      saveRequests(requests);
      displayRequests();
      displayUsers();
      alert(`User "${approvedUser.desiredUsername}" approved!`);
    }
    if (e.target.classList.contains('reject-btn')) {
      const index = e.target.dataset.index;
      const requests = loadRequests();
      const rejectedUser = requests.splice(index, 1)[0];
      saveRequests(requests);
      displayRequests();
      alert(`Registration request from "${rejectedUser.desiredUsername}" rejected.`);
    }
  });

  // Reset password
  usersTableBody.addEventListener('click', e => {
    if (e.target.classList.contains('reset-btn')) {
      const index = e.target.dataset.index;
      const input = document.getElementById(`resetPass-${index}`);
      const newPass = input.value.trim();
      if (newPass.length < 4) {
        alert('Password must be at least 4 characters.');
        return;
      }
      const users = loadUsers();
      users[index].password = newPass;
      saveUsers(users);
      input.value = '';
      alert(`Password for "${users[index].username}" reset successfully.`);
    }
  });

  displayRequests();
  displayUsers();
}
