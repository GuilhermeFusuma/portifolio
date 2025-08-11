# Overview

This is a comprehensive portfolio system built with Flask that allows creative professionals to showcase their work through a modern web interface. The platform features a public portfolio area for visitors to browse projects and achievements, an admin panel for content management, user authentication with social features like commenting and liking, and a responsive design optimized for all devices.

The system is designed around a dual-access model: public visitors can view content and interact through likes and comments (if registered), while admin users have full CRUD capabilities for managing their portfolio content. The platform emphasizes user engagement through social features while maintaining clean, professional presentation of creative work.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses Flask with Jinja2 templating and Bootstrap 5 for responsive design. The template structure follows a component-based approach with a base template and specialized sections for authentication, admin functionality, and public portfolio views. JavaScript handles client-side interactions like like buttons, smooth scrolling, and navbar effects. The design system uses CSS custom properties for a cohesive purple-blue color palette with smooth animations and transitions.

## Backend Architecture
Built on Flask with a modular blueprint structure separating authentication (`auth.py`) from main application routes (`routes.py`). The application follows the factory pattern in `app.py` for flexible configuration and testing. SQLAlchemy ORM handles database operations with a declarative base model approach. The system implements role-based access control with admin decorators and user session management through Flask-Login.

## Data Storage
Uses SQLite as the default database for simplicity and portability, with clear migration path to PostgreSQL. The data model includes core entities: Users (with role-based permissions), Projects and Achievements (main content types), Categories and Tags (for organization), Comments and Likes (social features), and PasswordReset tokens (security). Relationships are properly defined with cascade deletes and foreign key constraints.

## Authentication System
Multi-layer authentication system with email/password login, user registration with automatic admin detection based on configured email, password reset functionality with secure token generation, and prepared OAuth integration points. User sessions are managed through Flask-Login with "remember me" functionality and profile management capabilities.

## Content Management
Rich content management through CKEditor integration for detailed project/achievement descriptions, file upload system supporting multiple formats (images, videos, documents), category and tag organization with color-coded labels, draft/published workflow for content staging, and featured content highlighting for important items.

# External Dependencies

## Email Services
Flask-Mail integration for sending notifications and password reset emails. Requires SMTP configuration through environment variables (MAIL_SERVER, MAIL_PORT, etc.). Supports both development (localhost) and production email providers.

## File Storage
Local file storage system with organized upload directory structure. Image processing capabilities through PIL/Pillow for optimization and thumbnail generation. Configurable file size limits and allowed file type restrictions.

## Frontend Libraries
Bootstrap 5 for responsive CSS framework and components, Font Awesome for consistent iconography, CKEditor 5 for rich text content editing, and custom JavaScript for enhanced user interactions and animations.

## Development Tools
Flask-Migrate for database schema management and versioning, logging configuration for debugging and monitoring, and Werkzeug utilities for security features like password hashing and proxy handling.

## Social Integration
LinkedIn sharing functionality with custom preview generation, like system supporting anonymous user interaction, and comment system with moderation capabilities for registered users.