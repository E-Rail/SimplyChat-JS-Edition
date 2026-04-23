# SimplyChat

A simple, encrypted chat application built with Electron and Supabase.

## Features

- **End-to-End Encryption** — Messages encrypted using RSA-OAEP + AES-GCM
- **Email Verification** — Powered by Supabase Auth
- **OAuth Login** — Google and GitHub sign-in support
- **Real-Time Messaging** — Instant message delivery with 5-second polling fallback
- **Contact Management** — Add and manage contacts
- **Cross-Platform** — macOS (Universal) and Windows (x64)

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Desktop**: Electron
- **Encryption**: Web Crypto API (RSA-OAEP + AES-GCM)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/E-Rail/SimplyChat-JS-Edition.git

# Navigate to the project directory
cd SimplyChat-JS-Edition

# Install dependencies
npm install
```

### Running the App

```bash
# Development mode
npm run dev

# Or use the start script
npm start
```

### Building for Production

```bash
# Build for Mac (Universal)
npm run build:mac

# Build for Windows (x64)
npm run build:win

# Build both
npm run build:all
```

Output files are saved to `dist/`.

## Database Setup

Run the SQL in `src/supabase_setup.sql` in your Supabase SQL editor to set up the required tables and policies.

## Project Structure

```
SimplyChat-JS-Edition/
├── main.js              # Electron main process
├── preload.js           # Preload script for renderer
├── package.json         # Project configuration
├── icon.png             # Application icon
├── build.sh             # Build script
├── src/
│   ├── index.html       # Main chat interface
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── settings.html    # User settings page
│   ├── auth-callback.html # OAuth callback handler
│   ├── config.js        # App configuration
│   ├── auth.js          # Authentication logic
│   ├── cloudService.js  # Supabase service layer
│   ├── crypto.js        # E2E encryption utilities
│   ├── script.js        # Main application logic
│   ├── style.css        # Application styles
│   ├── debug.js         # Debug utilities
│   └── supabase_setup.sql # Database schema
└── .gitignore
```

## macOS Note

If you get "SimplyChat is damaged" error, run this in Terminal:

```bash
xattr -cr /Applications/SimplyChat.app
```

This is because the app is not code-signed with an Apple Developer certificate.

## License

MIT
