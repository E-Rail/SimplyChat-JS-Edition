// Import authentication functions
// Current user information
let currentUser = null;
let messages = [];
let contacts = [];
let currentContact = null;

// DOM Elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const currentUserSpan = document.getElementById("currentUser");
const contactsListDiv = document.getElementById("contactsList");

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    // Get current user
    currentUser = getCurrentUser();
    if (currentUser) {
        currentUserSpan.textContent = currentUser.username;
    }
    
    // Load contacts and messages
    loadContacts();
    loadMessages();
    renderContacts();
});

// Load contacts from cloud
function loadContacts() {
    const allUsers = getAllUsers();
    contacts = [];
    
    // Convert users to contacts format
    for (const username in allUsers) {
        if (username !== currentUser.username) { // Don't include current user
            contacts.push({
                id: allUsers[username].accountId,
                name: allUsers[username].username,
                email: allUsers[username].email,
                lastMessage: "No messages yet",
                timestamp: Date.now()
            });
        }
    }
    
    // If no contacts, add some defaults
    if (contacts.length === 0) {
        contacts = [
            { id: "1", name: "Alice", email: "alice@example.com", lastMessage: "Hey there!", timestamp: Date.now() - 3600000 },
            { id: "2", name: "Bob", email: "bob@example.com", lastMessage: "See you later", timestamp: Date.now() - 7200000 },
            { id: "3", name: "Charlie", email: "charlie@example.com", lastMessage: "Thanks for the help", timestamp: Date.now() - 86400000 }
        ];
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
        contactDiv.innerHTML = `
            <div class="contact-name"><strong>${contact.name}</strong></div>
            <div class="contact-last-message">${contact.lastMessage}</div>
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

// Load messages from localStorage (exclusive to user pairs)
function loadMessages() {
    if (!currentUser || !currentContact) {
        messages = [];
        renderMessages();
        return;
    }
    
    // Create a unique key for this conversation
    const conversationKey = getConversationKey(currentUser.accountId, currentContact.id);
    const savedMessages = localStorage.getItem(conversationKey);
    
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    } else {
        messages = [];
    }
    
    renderMessages();
}

// Save messages to localStorage (exclusive to user pairs)
function saveMessages() {
    if (!currentUser || !currentContact) return;
    
    // Create a unique key for this conversation
    const conversationKey = getConversationKey(currentUser.accountId, currentContact.id);
    localStorage.setItem(conversationKey, JSON.stringify(messages));
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
function sendMessage() {
    const text = input.value.trim();
    if (text === "" || !currentUser || !currentContact) return;
    
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