// Cloud Service Simulation
// This simulates cloud storage for account data only
// All chat messages remain local between users

class CloudService {
    constructor() {
        // Simulate cloud database
        this.cloudDatabase = this.loadCloudDB();
    }
    
    // Load cloud database from localStorage (in a real app, this would connect to a server)
    loadCloudDB() {
        const db = localStorage.getItem('cloudDB');
        return db ? JSON.parse(db) : {
            users: {},
            accounts: {}
        };
    }
    
    // Save cloud database to localStorage (in a real app, this would send to a server)
    saveCloudDB() {
        localStorage.setItem('cloudDB', JSON.stringify(this.cloudDatabase));
    }
    
    // User Registration
    registerUser(username, email, password) {
        // Check if username already exists
        if (this.cloudDatabase.users[username]) {
            return { success: false, message: 'Username already exists' };
        }
        
        // Create new user in cloud
        this.cloudDatabase.users[username] = {
            username: username,
            email: email,
            password: password, // In a real app, this would be hashed
            createdAt: new Date().toISOString(),
            accountId: this.generateAccountId()
        };
        
        // Create account record
        this.cloudDatabase.accounts[this.cloudDatabase.users[username].accountId] = {
            userId: username,
            createdAt: new Date().toISOString()
        };
        
        this.saveCloudDB();
        return { success: true, message: 'Registration successful' };
    }
    
    // User Login
    loginUser(username, password) {
        const user = this.cloudDatabase.users[username];
        if (user && user.password === password) {
            return { 
                success: true, 
                user: {
                    username: user.username,
                    email: user.email,
                    accountId: user.accountId
                }
            };
        }
        return { success: false, message: 'Invalid username or password' };
    }
    
    // Update User Profile
    updateUserProfile(accountId, userData) {
        // Find user by accountId
        const account = this.cloudDatabase.accounts[accountId];
        if (!account) {
            return { success: false, message: 'Account not found' };
        }
        
        const user = this.cloudDatabase.users[account.userId];
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // Update user data
        Object.assign(user, userData, { updatedAt: new Date().toISOString() });
        this.saveCloudDB();
        
        return { success: true, message: 'Profile updated successfully' };
    }
    
    // Get User by Account ID
    getUserByAccountId(accountId) {
        const account = this.cloudDatabase.accounts[accountId];
        if (!account) return null;
        
        return this.cloudDatabase.users[account.userId];
    }
    
    // Generate a unique account ID
    generateAccountId() {
        return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Get all users (for contacts)
    getAllUsers() {
        const users = {};
        for (const username in this.cloudDatabase.users) {
            users[username] = {
                username: this.cloudDatabase.users[username].username,
                email: this.cloudDatabase.users[username].email,
                accountId: this.cloudDatabase.users[username].accountId
            };
        }
        return users;
    }
}

// Create a global instance
const cloudService = new CloudService();