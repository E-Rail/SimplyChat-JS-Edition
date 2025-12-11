// Import authentication functions
// Current user information
let currentUser = null;
let messages = [];
let contacts = [];
let currentContact = null;
let messageSubscription = null;

// DOM Elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const currentUserSpan = document.getElementById("currentUser");
const contactsListDiv = document.getElementById("contactsList");

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication first
    if (!await checkAuth()) {
        return;
    }
    
    // Get current user
    currentUser = getCurrentUser();
    if (currentUser) {
        currentUserSpan.textContent = currentUser.username;
    }
    
    // Load contacts and messages
    await loadContacts();
    loadMessages();
    renderContacts();
    
    // Setup real-time messaging
    setupRealTimeMessaging();
    
    // Setup add contact button
    setupAddContactButton();
});

// Setup real-time messaging
async function setupRealTimeMessaging() {
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (cloudServiceInstance && currentUser) {
        // Subscribe to messages
        messageSubscription = cloudServiceInstance.subscribeToMessages(currentUser.accountId, handleNewMessage);
    }
}

// Handle new incoming messages
function handleNewMessage(message) {
    // Check if this message is for the current conversation
    if (currentContact && 
        ((message.sender_id === currentContact.id && message.receiver_id === currentUser.accountId) ||
         (message.sender_id === currentUser.accountId && message.receiver_id === currentContact.id))) {
        
        // Add message to UI
        const formattedMessage = {
            text: message.content,
            senderId: message.sender_id,
            senderName: message.sender_id === currentUser.accountId ? currentUser.username : currentContact.name,
            receiverId: message.receiver_id,
            timestamp: new Date(message.created_at).getTime()
        };
        
        messages.push(formattedMessage);
        addMessageToDOM(formattedMessage, messages.length - 1);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Update contact's last message
        if (currentContact) {
            currentContact.lastMessage = message.content;
            currentContact.timestamp = new Date(message.created_at).getTime();
            saveContacts();
            renderContacts();
        }
    }
}

// Load contacts from cloud
async function loadContacts() {
    const allUsers = await getAllUsers();
    contacts = [];
    
    // Convert users to contacts format
    for (const username in allUsers) {
        // Exclude current user and any users with "ABC" in their name
        if (username !== currentUser.username && !username.toLowerCase().includes('abc')) {
            contacts.push({
                id: allUsers[username].accountId,
                name: allUsers[username].username,
                email: allUsers[username].email,
                lastMessage: "No messages yet",
                timestamp: Date.now()
            });
        }
    }
    
    // If no contacts, add some defaults (but still exclude ABC people)
    if (contacts.length === 0) {
        contacts = [
            { id: "1", name: "Alice", email: "alice@example.com", lastMessage: "Hey there!", timestamp: Date.now() - 3600000 },
            { id: "2", name: "Bob", email: "bob@example.com", lastMessage: "See you later", timestamp: Date.now() - 7200000 },
            { id: "3", name: "Charlie", email: "charlie@example.com", lastMessage: "Thanks for the help", timestamp: Date.now() - 86400000 }
        ].filter(contact => !contact.name.toLowerCase().includes('abc'));
    }
    
    saveContacts();
}

// Save contacts to localStorage (contacts are local)
function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Render contacts list
function renderContacts() {
    contactsListDiv.innerHTML = "";
    contacts.forEach(contact => {
        const contactDiv = document.createElement("div");
        contactDiv.className = "contact-item";
        
        // Get first letter of name for avatar
        const firstLetter = contact.name.charAt(0).toUpperCase();
        
        contactDiv.innerHTML = `
            <div class="contact-avatar">${firstLetter}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-last-message">${contact.lastMessage}</div>
            </div>
            <div class="contact-timestamp">${formatTime(contact.timestamp)}</div>
        `;
        contactDiv.addEventListener("click", () => selectContact(contact));
        contactsListDiv.appendChild(contactDiv);
    });
}

// Select a contact to chat with
function selectContact(contact) {
    // Remove active class from all contacts
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected contact
    event.currentTarget.classList.add('active');
    
    // Set current contact
    currentContact = contact;
    
    // Load messages for this contact
    loadMessages();
    
    console.log("Selected contact:", contact);
}

// Load messages from cloud (instead of localStorage)
async function loadMessages() {
    if (!currentUser || !currentContact) {
        messages = [];
        renderMessages();
        return;
    }
    
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (cloudServiceInstance) {
        const result = await cloudServiceInstance.getMessagesBetweenUsers(currentUser.accountId, currentContact.id);
        
        if (result.success) {
            messages = result.data.map(msg => ({
                text: msg.content,
                senderId: msg.sender_id,
                senderName: msg.sender_id === currentUser.accountId ? currentUser.username : currentContact.name,
                receiverId: msg.receiver_id,
                timestamp: new Date(msg.created_at).getTime()
            }));
        } else {
            messages = [];
        }
    } else {
        // Fallback to localStorage if cloud service is not available
        const conversationKey = getConversationKey(currentUser.accountId, currentContact.id);
        const savedMessages = localStorage.getItem(conversationKey);
        
        if (savedMessages) {
            messages = JSON.parse(savedMessages);
        } else {
            messages = [];
        }
    }
    
    renderMessages();
}

// Save messages to cloud (instead of localStorage)
async function saveMessages() {
    // Messages are now saved in real-time to the cloud, so we don't need this function anymore
    // But we'll keep it for backward compatibility
}

// Generate a unique key for a conversation between two users
function getConversationKey(user1Id, user2Id) {
    // Sort IDs to ensure consistent key regardless of order
    const ids = [user1Id, user2Id].sort();
    return `conversation_${ids[0]}_${ids[1]}`;
}

// Render all messages
function renderMessages() {
    messagesDiv.innerHTML = "";
    messages.forEach((msg, index) => {
        addMessageToDOM(msg, index);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Add a message to the DOM
function addMessageToDOM(msg, index) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(msg.senderId === currentUser.accountId ? "sent" : "received");
    messageDiv.dataset.index = index;
    
    const messageHeader = document.createElement("div");
    messageHeader.classList.add("message-header");
    messageHeader.innerHTML = `
        <span class="sender">${msg.senderName}</span>
    `;
    
    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = msg.text;
    
    const timestamp = document.createElement("div");
    timestamp.classList.add("timestamp");
    timestamp.textContent = formatTime(msg.timestamp);
    
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageText);
    messageDiv.appendChild(timestamp);
    
    messagesDiv.appendChild(messageDiv);
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Send a new message
async function sendMessage() {
    const text = input.value.trim();
    if (text === "" || !currentUser || !currentContact) return;
    
    // Wait for cloud service to be available
    await waitForSupabase();
    
    if (cloudServiceInstance) {
        // Send message to cloud
        const result = await cloudServiceInstance.sendMessage(
            currentUser.accountId,
            currentContact.id,
            text
        );
        
        if (result.success) {
            // Add message to UI immediately
            const message = {
                text: text,
                senderId: currentUser.accountId,
                senderName: currentUser.username,
                receiverId: currentContact.id,
                timestamp: new Date().getTime()
            };
            
            messages.push(message);
            addMessageToDOM(message, messages.length - 1);
            
            // Update the last message for the active contact
            currentContact.lastMessage = text;
            currentContact.timestamp = new Date().getTime();
            saveContacts();
            renderContacts();
            
            input.value = "";
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } else {
            console.error("Failed to send message:", result.message);
            // Fallback to localStorage if cloud service fails
            fallbackSendMessage(text);
        }
    } else {
        // Fallback to localStorage if cloud service is not available
        fallbackSendMessage(text);
    }
}

// Fallback function to send message using localStorage
function fallbackSendMessage(text) {
    const message = {
        text: text,
        senderId: currentUser.accountId,
        senderName: currentUser.username,
        receiverId: currentContact.id,
        timestamp: new Date().getTime()
    };
    
    messages.push(message);
    saveMessages();
    addMessageToDOM(message, messages.length - 1);
    
    // Update the last message for the active contact
    currentContact.lastMessage = text;
    currentContact.timestamp = new Date().getTime();
    saveContacts();
    renderContacts();
    
    input.value = "";
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);

// Voice button functionality
document.addEventListener('DOMContentLoaded', function() {
    const voiceBtn = document.querySelector('.voice-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            alert('Voice message feature would be implemented here');
        });
    }
});

// Send on ENTER key
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// ---- Custom Right-Click Menu ----
const contextMenu = document.createElement("div");
contextMenu.id = "contextMenu";

const menuItems = [
    { text: "Copy", action: copyMessage },
    { text: "Forward", action: forwardMessage },
    { text: "Quote", action: quoteMessage },
    { text: "Delete", action: deleteMessage }
];

menuItems.forEach(item => {
    const menuItem = document.createElement("div");
    menuItem.classList.add("context-menu-item");
    menuItem.textContent = item.text;
    menuItem.addEventListener("click", item.action);
    contextMenu.appendChild(menuItem);
});

document.body.appendChild(contextMenu);

let selectedMessageIndex = null;

messagesDiv.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    
    // Find the message element (bubble) that was clicked
    let messageElement = event.target;
    while (messageElement && !messageElement.classList.contains("message")) {
        messageElement = messageElement.parentElement;
    }
    
    if (messageElement) {
        selectedMessageIndex = parseInt(messageElement.dataset.index);
        
        contextMenu.style.left = event.pageX + "px";
        contextMenu.style.top = event.pageY + "px";
        contextMenu.style.display = "block";
    }
});

// Hide on click elsewhere
document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});

// Context Menu Actions
function copyMessage() {
    if (selectedMessageIndex !== null) {
        const message = messages[selectedMessageIndex];
        navigator.clipboard.writeText(message.text).then(() => {
            console.log("Message copied to clipboard");
        }).catch(err => {
            console.error("Failed to copy message: ", err);
        });
    }
    contextMenu.style.display = "none";
}

function forwardMessage() {
    if (selectedMessageIndex !== null) {
        const message = messages[selectedMessageIndex];
        // In a real app, this would open a forwarding interface
        console.log("Forwarding message:", message.text);
        alert(`Forwarding message: "${message.text}"`);
    }
    contextMenu.style.display = "none";
}

function quoteMessage() {
    if (selectedMessageIndex !== null) {
        const message = messages[selectedMessageIndex];
        input.value = `"${message.text}" `;
        input.focus();
    }
    contextMenu.style.display = "none";
}

function deleteMessage() {
    if (selectedMessageIndex !== null) {
        if (confirm("Are you sure you want to delete this message?")) {
            messages.splice(selectedMessageIndex, 1);
            saveMessages();
            renderMessages();
        }
    }
    contextMenu.style.display = "none";
}

// Setup add contact button functionality
function setupAddContactButton() {
    const addContactBtn = document.getElementById('addContactBtn');
    const addContactModal = document.getElementById('addContactModal');
    const cancelAddContact = document.getElementById('cancelAddContact');
    const addContactForm = document.getElementById('addContactForm');
    
    if (addContactBtn) {
        addContactBtn.addEventListener('click', function() {
            addContactModal.style.display = 'block';
        });
    }
    
    if (cancelAddContact) {
        cancelAddContact.addEventListener('click', function() {
            addContactModal.style.display = 'none';
        });
    }
    
    if (addContactForm) {
        addContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('contactEmail').value;
            addNewContact(email);
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addContactModal) {
            addContactModal.style.display = 'none';
        }
    });
}

// Add new contact functionality
async function addNewContact(email) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if email exists in accounts list
    const allUsers = await getAllUsers();
    let foundUser = null;
    
    for (const username in allUsers) {
        // Skip ABC people and current user
        if (username.toLowerCase().includes('abc') || username === currentUser.username) {
            continue;
        }
        
        if (allUsers[username].email === email) {
            foundUser = allUsers[username];
            break;
        }
    }
    
    if (foundUser) {
        // User exists, add as contact if not already added
        const existingContact = contacts.find(contact => contact.id === foundUser.accountId);
        if (existingContact) {
            alert('This contact is already in your list');
        } else {
            // Add user as contact
            contacts.push({
                id: foundUser.accountId,
                name: foundUser.username,
                email: foundUser.email,
                lastMessage: "No messages yet",
                timestamp: Date.now()
            });
            saveContacts();
            renderContacts();
            alert('Contact added successfully!');
        }
    } else {
        // User doesn't exist, save as local contact
        const existingContact = contacts.find(contact => contact.email === email);
        if (existingContact) {
            alert('This contact is already in your list');
        } else {
            contacts.push({
                id: 'local_' + Date.now(),
                name: email.split('@')[0], // Use part before @ as name
                email: email,
                lastMessage: "No messages yet",
                timestamp: Date.now()
            });
            saveContacts();
            renderContacts();
            alert('Contact saved locally!');
        }
    }
    
    // Close modal and clear form
    document.getElementById('addContactModal').style.display = 'none';
    document.getElementById('contactEmail').value = '';
}