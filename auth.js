// Authentication System using Supabase
// Load Supabase client from window
let cloudServiceInstance;

// Wait for DOM and Supabase to be ready
function waitForSupabase() {
    return new Promise((resolve) => {
        const checkSupabase = () => {
            // Check if Supabase is available
            if (typeof window.supabase !== 'undefined') {
                // Check if CloudService class is available
                if (typeof window.CloudService !== 'undefined') {
                    if (!cloudServiceInstance) {
                        cloudServiceInstance = new window.CloudService();
                        console.log('CloudService instance created:', !!cloudServiceInstance);
                    }
                    resolve(true);
                } else {
                    // If CloudService class is not available, create a fallback
                    console.log('CloudService class not found, creating fallback');
                    cloudServiceInstance = {
                        registerUser: async (username, email, password) => {
                            console.log('Using fallback registerUser');
                            return { success: false, message: 'Cloud service not available' };
                        },
                        loginUser: async (username, password) => {
                            console.log('Using fallback loginUser');
                            return { success: false, message: 'Cloud service not available' };
                        },
                        getAllUsers: async () => {
                            console.log('Using fallback getAllUsers');
                            return {};
                        },
                        updateUserProfile: async (accountId, userData) => {
                            console.log('Using fallback updateUserProfile');
                            return { success: false, message: 'Cloud service not available' };
                        },
                        getUserByAccountId: async (accountId) => {
                            console.log('Using fallback getUserByAccountId');
                            return null;
                        },
                        sendMessage: async (senderId, receiverId, content) => {
                            console.log('Using fallback sendMessage');
                            return { success: false, message: 'Cloud service not available' };
                        },
                        getMessagesBetweenUsers: async (userId1, userId2) => {
                            console.log('Using fallback getMessagesBetweenUsers');
                            return { success: false, message: 'Cloud service not available', data: [] };
                        },
                        subscribeToMessages: (userId, callback) => {
                            console.log('Using fallback subscribeToMessages');
                            return null;
                        }
                    };
                    resolve(true);
                }
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
}

// Check if user is logged in
async function checkAuth() {
    // Wait for Supabase to be ready
    await waitForSupabase();
    
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
async function login(username, password) {
    console.log('Login function called with:', username);
    
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (!cloudServiceInstance) {
        console.error('Cloud service not available');
        return { success: false, message: 'System not ready, please try again' };
    }
    
    const result = await cloudServiceInstance.loginUser(username, password);
    console.log('Login result:', result);
    
    if (result.success) {
        localStorage.setItem('currentUser', username);
        localStorage.setItem('currentAccount', JSON.stringify(result.user));
        return result;
    }
    
    return result;
}

// Register function
async function register(username, email, password) {
    console.log('Register function called with:', username, email);
    
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (!cloudServiceInstance) {
        console.error('Cloud service not available');
        return { success: false, message: 'System not ready, please try again' };
    }
    
    const result = await cloudServiceInstance.registerUser(username, email, password);
    console.log('Registration result:', result);
    
    return result;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAccount');
    // Clear chat data for privacy
    localStorage.removeItem('contacts');
    
    // Clear conversation data but keep user accounts in cloudDB
    // Get all keys and remove only conversation keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('conversation_')) {
            localStorage.removeItem(key);
        }
    }
    
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
async function updateUserProfile(userData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (!cloudServiceInstance) {
        return { success: false, message: 'System not ready, please try again' };
    }
    
    return await cloudServiceInstance.updateUserProfile(currentUser.accountId, userData);
}

// Get all users for contacts
async function getAllUsers() {
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (!cloudServiceInstance) {
        return {};
    }
    
    return await cloudServiceInstance.getAllUsers();
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