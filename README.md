# Creative Portfolio System

A comprehensive portfolio platform built with Flask and Bootstrap, featuring an admin panel, public portfolio area, user authentication, social features, and responsive design.

## Features

### 🎨 Design & User Experience
- **Purple & Blue Color Palette**: Modern, professional design with customizable themes
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Minimalist Interface**: Clean, focused design that highlights content

### 👤 User Management
- **Multi-tier Authentication**: Email/password login with planned OAuth integration
- **Admin Panel**: Restricted access for portfolio owner with full CRUD capabilities
- **User Profiles**: Customizable profiles with photos and bio information
- **Password Recovery**: Secure email-based password reset system

### 📁 Content Management
- **Projects & Achievements**: Comprehensive CRUD operations for portfolio content
- **Rich Content Editor**: CKEditor integration for detailed content creation
- **File Upload System**: Support for images, videos, and documents
- **Category & Tag System**: Organized content with filtering capabilities
- **Draft/Published Status**: Content workflow management
- **Featured Content**: Highlight important projects and achievements

### 💬 Social Features
- **Like System**: Anonymous visitor engagement with like counters
- **Comment System**: Registered user discussions with moderation
- **LinkedIn Sharing**: Custom preview generation for social sharing
- **Comment Moderation**: Admin approval and management system

### 📧 Notifications
- **Email Notifications**: Configurable alerts for new comments
- **Admin Alerts**: Internal notifications for content management
- **User Preferences**: Individual notification settings

## Tech Stack

### Backend
- **Python 3.8+**
- **Flask**: Web framework with blueprints
- **SQLAlchemy**: ORM for database management
- **SQLite**: Default database (easily upgradable to PostgreSQL)
- **Flask-Login**: User session management
- **Flask-Mail**: Email functionality
- **Flask-WTF**: Form handling and validation
- **Werkzeug**: Security utilities

### Frontend
- **HTML5 & CSS3**: Modern web standards
- **Bootstrap 5**: Responsive component framework
- **Vanilla JavaScript**: Client-side functionality
- **Font Awesome**: Icon library
- **CKEditor**: Rich text editing

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creative-portfolio
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   