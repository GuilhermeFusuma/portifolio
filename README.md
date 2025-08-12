# Portfolio Website

A comprehensive Flask-based portfolio system with admin panel, authentication, social features, and responsive design using a modern purple/blue theme.

## Features

### 🎨 Modern Design
- Purple and blue gradient theme
- Responsive Bootstrap 5 layout
- Smooth animations and transitions
- Mobile-first design approach
- Custom CSS with CSS variables
- Interactive hero section with code preview

### 🔐 Authentication System
- Email/password authentication
- OAuth integration (Google & LinkedIn)
- Password recovery via email
- User profile management
- Admin-only access controls
- JWT token support

### 📊 Content Management
- **Projects**: Create, edit, and showcase development projects
- **Achievements**: Display certifications and professional milestones
- **Categories**: Organize content with color-coded categories
- **Tags**: Flexible tagging system for easy filtering
- **Media Upload**: Support for images and documents
- **Rich Text Editor**: CKEditor integration for detailed content

### 💬 Social Features
- **Like System**: Anonymous and authenticated likes
- **Comments**: User comments with admin moderation
- **Social Sharing**: LinkedIn and Twitter integration
- **Email Notifications**: Admin alerts for new comments
- **Real-time Updates**: Dynamic content updates

### 🛠 Admin Panel
- **Dashboard**: Overview of projects, achievements, and comments
- **Content Management**: Full CRUD operations
- **Comment Moderation**: Approve, reject, or delete comments
- **User Management**: View and manage user accounts
- **Statistics**: Track views, likes, and engagement
- **Bulk Actions**: Efficient content management tools

## Tech Stack

### Backend
- **Flask**: Main web framework
- **Flask-SQLAlchemy**: Database ORM
- **Flask-Login**: Session management
- **Flask-WTF**: Form handling and CSRF protection
- **Flask-Mail**: Email notifications
- **PyJWT**: JWT token handling
- **Werkzeug**: File uploads and security

### Frontend
- **Bootstrap 5**: Responsive framework
- **Font Awesome**: Icon library
- **CKEditor 5**: Rich text editing
- **Custom CSS**: Modern styling with CSS variables
- **Vanilla JavaScript**: Interactive features

### Database
- **SQLite**: Development database
- **PostgreSQL**: Production ready (easy migration)

## Installation

### Prerequisites
- Python 3.8+
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd portfolio
