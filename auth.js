// Authentication System using Cloud Service for account data
// Load cloud service
// @ts-ignore
if (typeof cloudService === 'undefined') {
    // Fallback if cloudService.js is not loaded
    var cloudService = {
        registerUser: function(username, email, password) {
            let users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[username]) {
                return { success: false, message: 'Username already exists' };
            }
            users[username] = {
                username: username,
                email: email,
                password: password,
                createdAt: new Date().toISOString(),
                accountId: 'acc_' + Date.now()
            };
            localStorage.setItem('users', JSON.stringify(users));
            return { success: true, message: 'Registration successful' };
        },
        loginUser: function(username, password) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[username] && users[username].password === password) {
                return { success: true, user: users[username] };
            }
            return { success: false, message: 'Invalid username or password' };
        },
        updateUserProfile: function(accountId, userData) {
            const username = localStorage.getItem('currentUser');
            if (!username) return { success: false, message: 'Not logged in' };
            let users = JSON.parse(localStorage.getItem('users') || '{}');
            if (!users[username]) return { success: false, message: 'User not found' };
            users[username] = {
                ...users[username],
                ...userData,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('users', JSON.stringify(users));
            return { success: true, message: 'Profile updated successfully' };
        },
        getAllUsers: function() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }
    };
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPath = window.location.pathname;
    
    // If not logged in and not on auth pages, redirect to login
    if (!currentUser && !currentPath.includes('login.html') && !currentPath.includes('register.html')) {
        // For index.html, we'll show the modal instead of redirecting
        if (!currentPath.includes('index.html')) {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    // If logged in and on auth pages, redirect to chat
    if (currentUser && (currentPath.includes('login.html') || currentPath.includes('register.html'))) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Login function
function login(username, password) {
    const result = cloudService.loginUser(username, password);
    
    if (result.success) {
        localStorage.setItem('currentUser', username);
        localStorage.setItem('currentAccount', JSON.stringify(result.user));
        return result;
    }
    
    return result;
}

// Register function
function register(username, email, password) {
    return cloudService.registerUser(username, email, password);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAccount');
    // Clear chat data for privacy
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('contacts');
    
    // If on index.html, show login modal
    if (window.location.pathname.includes('index.html')) {
        document.getElementById('loginModal').style.display = 'block';
    } else {
        window.location.href = 'login.html';
    }
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentAccount');
    if (!userStr) return null;
    return JSON.parse(userStr);
}

// Update user profile
function updateUserProfile(userData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    return cloudService.updateUserProfile(currentUser.accountId, userData);
}

// Get all users for contacts
function getAllUsers() {
    return cloudService.getAllUsers();
}

// Handle login form submission
if (document.getElementById('loginForm') && !document.querySelector('#loginModal')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const result = login(username, password);
        
        if (result.success) {
            window.location.href = 'index.html';
        } else {
            alert(result.message);
        }
    });
}

// Handle registration form submission
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const result = register(username, email, password);
        
        if (result.success) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    });
}

// Handle settings form submission
if (document.getElementById('settingsForm')) {
    // Load current user data
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('displayName').value = currentUser.username;
        document.getElementById('email').value = currentUser.email || '';
    }
    
    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const displayName = document.getElementById('displayName').value;
        const email = document.getElementById('email').value;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // Validate current password if changing password
        if (newPassword || confirmNewPassword) {
            if (newPassword !== confirmNewPassword) {
                alert('New passwords do not match');
                return;
            }
            
            // In a real app, we would verify current password against stored hash
            // For this demo, we'll skip this check
        }
        
        // Prepare update data
        const updateData = {
            email: email
        };
        
        // Update password if provided
        if (newPassword) {
            updateData.password = newPassword;
        }
        
        const result = updateUserProfile(updateData);
        
        if (result.success) {
            alert('Profile updated successfully');
            // Reload user data
            window.location.reload();
        } else {
            alert(result.message);
        }
    });
}

// Handle logout button
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);