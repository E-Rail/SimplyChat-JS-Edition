# SimplyChat

A lightweight, privacy-focused chat application with cloud-based account management and local message storage.

## Description

SimplyChat is a web-based chat application that prioritizes user privacy by storing all chat messages locally between users while keeping only account information in the cloud. The application features a clean, grey-themed interface with contact management, secure messaging, and user authentication.

## Key Features

- **Privacy First**: Chat messages are stored exclusively between users locally
- **Cloud Account Management**: User account data stored securely in cloud
- **Contact Management**: Organize conversations with a contacts sidebar
- **Secure Authentication**: Login and registration system
- **User Settings**: Profile management and customization
- **Modern UI**: Clean grey color scheme with minimalist design
- **Message Functions**: Copy, forward, quote, and delete messages

## Installation

Simply open `index.html` in a web browser to get started. No additional installation required.

## Usage

1. **Register** a new account or **Login** with existing credentials
2. View your **Contacts** in the left sidebar
3. Select a contact to start chatting
4. Messages are saved automatically and exclusively between users
5. Use right-click context menu for message options

## Cloud Service Integration

The application is designed to work with various cloud services. Recommended options include:

### Supabase (Recommended)
- Works reliably in China and globally
- Free tier with generous limits
- Real-time database capabilities
- Easy JavaScript integration

### Firebase
- Global infrastructure with real-time features
- Note: May have limitations in China

### MongoDB Atlas
- Database-as-a-service with global clusters
- Good performance in Asia-Pacific region

## File Structure

- `index.html` - Main chat interface with login modal
- `login.html` - Login page
- `register.html` - User registration page
- `settings.html` - User profile settings
- `style.css` - All styling
- `script.js` - Main chat functionality
- `auth.js` - Authentication system
- `cloudService.js` - Cloud service simulation (can be replaced with real service)

## Support

For issues or feature requests, please submit them through the project repository.

## Contributing

Contributions are welcome! Feel free to fork the project and submit pull requests.

## Authors

Developed as a privacy-focused chat solution.

## License

MIT License

## Project Status

Active development