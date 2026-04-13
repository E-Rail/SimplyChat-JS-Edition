# SimplyChat

A simple, lightweight chat application built with Electron and Supabase.

## Features

- User registration and authentication
- Real-time messaging
- Contact management
- Message context menu (copy, forward, quote, delete)
- Cross-platform desktop app (macOS, Windows, Linux)

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Desktop**: Electron

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/SimplyChat-JS-Edition.git

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
# Build for your platform
npm run build

# Or use the build script
./build.sh
```

## Project Structure

```
SimplyChat-JS-Edition/
├── main.js              # Electron main process
├── preload.js           # Preload script for renderer
├── package.json         # Project configuration
├── build.sh             # Build script
├── src/
│   ├── index.html       # Main chat interface
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── settings.html    # User settings page
│   ├── config.js        # App configuration
│   ├── auth.js          # Authentication logic
│   ├── cloudService.js  # Supabase service layer
│   ├── script.js        # Main application logic
│   ├── style.css        # Application styles
│   ├── debug.js         # Debug utilities
│   └── supabase_setup.sql # Database schema
└── .gitignore
```

## Database Setup

Run the SQL in `src/supabase_setup.sql` in your Supabase SQL editor to set up the required tables and policies.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 SimplyChat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
