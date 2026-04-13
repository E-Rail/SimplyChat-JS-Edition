// Authentication System using Supabase
// Load Supabase client from window
let cloudServiceInstance = null;

// Initialize Cloud Service
async function initCloudService() {
    if (cloudServiceInstance) {
        return cloudServiceInstance;
    }
    
    // Wait for Supabase to be available
    await waitForSupabase();
    
    if (window.CloudService) {
        cloudServiceInstance = new window.CloudService();
        console.log('Cloud service initialized');
        return cloudServiceInstance;
    } else {
        console.error('CloudService class not found');
        return null;
    }
}

// Wait for Supabase to be available
function waitForSupabase(maxAttempts = 50) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const checkSupabase = () => {
            if (window.supabase) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Supabase failed to load'));
            } else {
                attempts++;
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
}

// Registration function
async function register(username, email, password) {
    try {
        console.log('Register function called with:', username, email);
        
        // Initialize cloud service
        const cloudService = await initCloudService();
        if (!cloudService) {
            return { success: false, message: 'Cloud service not available' };
        }
        
        // Register user
        const result = await cloudService.registerUser(username, email, password);
        
        if (result.success) {
            // Save user info to localStorage
            const userInfo = {
                username: result.user.username,
                email: result.user.email,
                accountId: result.user.id
            };
            localStorage.setItem('currentAccount', JSON.stringify(userInfo));
            localStorage.setItem('currentUser', username);
            console.log('Registration successful, user saved to localStorage');
            
            // Generate E2E encryption keys for new user
            const cloudService = await initCloudService();
            if (typeof E2E !== 'undefined' && cloudService) {
                await E2E.initializeKeys(userInfo.accountId, cloudService);
            }
        }
        
        return result;
    } catch (err) {
        console.error('Registration error:', err);
        return { success: false, message: 'Registration failed: ' + err.message };
    }
}

// Login function
async function login(username, password) {
    try {
        console.log('Login function called with:', username);
        
        // Initialize cloud service
        const cloudService = await initCloudService();
        if (!cloudService) {
            return { success: false, message: 'Cloud service not available' };
        }
        
        // Login user
        const result = await cloudService.loginUser(username, password);
        
        if (result.success) {
            // Save user info to localStorage
            localStorage.setItem('currentAccount', JSON.stringify(result.user));
            localStorage.setItem('currentUser', username);
            console.log('Login successful, user saved to localStorage');
            
            // Ensure E2E encryption keys exist
            const cloudService = await initCloudService();
            if (typeof E2E !== 'undefined' && cloudService) {
                await E2E.initializeKeys(result.user.accountId, cloudService);
            }
        }
        
        return result;
    } catch (err) {
        console.error('Login error:', err);
        return { success: false, message: 'Login failed: ' + err.message };
    }
}

// Check authentication status
async function checkAuth() {
    // Initialize cloud service
    await initCloudService();
    
    const currentUser = localStorage.getItem('currentUser');
    const currentAccount = localStorage.getItem('currentAccount');
    
    if (!currentUser || !currentAccount) {
        // Redirect to login page if not authenticated
        if (window.location.pathname.includes('index.html')) {
            // For index.html, we'll handle this in the main script
            return false;
        } else if (!window.location.pathname.includes('login.html') && 
                   !window.location.pathname.includes('register.html')) {
            window.location.href = 'login.html';
            return false;
        }
    }
    
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAccount');
    // Clear chat data for privacy
    localStorage.removeItem('contacts');
    
    // Clear E2E encryption keys
    if (typeof E2E !== 'undefined') {
        E2E.clearKeys();
    }
    
    // Clear conversation data but keep user accounts in cloudDB
    // Collect keys first to avoid index shifting during removal
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('conversation_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // If on index.html, redirect to login
    if (window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
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

// Get all users
async function getAllUsers() {
    // Initialize cloud service
    const cloudService = await initCloudService();
    if (!cloudService) {
        console.error('Cloud service not available');
        return {};
    }
    
    return await cloudService.getAllUsers();
}

// Update user profile
async function updateUserProfile(userData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    // Initialize cloud service
    const cloudService = await initCloudService();
    if (!cloudService) {
        return { success: false, message: 'System not ready, please try again' };
    }
    
    return await cloudService.updateUserProfile(currentUser.accountId, userData);
}

// Handle login form submission for standalone login page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm') && !document.querySelector('#loginModal')) {
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = await login(username, password);
            
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                alert(result.message);
            }
        });
    }
});

// Handle login form submission for modal login
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm') && document.querySelector('#loginModal')) {
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // For modal, check both possible ID formats
            const usernameInput = document.getElementById('modalUsername') || document.getElementById('username');
            const passwordInput = document.getElementById('modalPassword') || document.getElementById('password');
            
            const username = usernameInput.value;
            const password = passwordInput.value;
            
            const result = await login(username, password);
            
            if (result.success) {
                // Hide modal and reload or redirect
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'none';
                }
                // Reload to show chat interface
                location.reload();
            } else {
                alert(result.message);
            }
        });
    }
});

// Handle registration form submission
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
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
            
            const result = await register(username, email, password);
            
            if (result.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(result.message);
            }
        });
    }
});

// Handle settings form submission
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('settingsForm')) {
        // Load current user data
        const currentUser = getCurrentUser();
        if (currentUser) {
            document.getElementById('displayName').value = currentUser.username;
            document.getElementById('email').value = currentUser.email || '';
        }
        
        document.getElementById('settingsForm').addEventListener('submit', async function(e) {
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
            
            const result = await updateUserProfile(updateData);
            
            if (result.success) {
                alert('Profile updated successfully');
                // Reload user data
                window.location.reload();
            } else {
                alert(result.message);
            }
        });
    }
});

// Handle logout button
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
});

// Run auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure cloud service is ready
    setTimeout(checkAuth, 100);
});