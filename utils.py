import os
import re
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import current_app, flash, redirect, url_for, abort
from flask_login import current_user
from flask_mail import Message
import jwt

from app import mail

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'pdf'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """Get file type based on extension"""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    if ext in ['png', 'jpg', 'jpeg', 'gif']:
        return 'image'
    elif ext in ['mp4', 'mov', 'avi']:
        return 'video'
    elif ext == 'pdf':
        return 'document'
    else:
        return 'other'

def create_slug(title, model_class):
    """Create a unique slug from title"""
    # Basic slug creation
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug).strip('-')
    
    # Ensure uniqueness
    original_slug = slug
    counter = 1
    
    while model_class.query.filter_by(slug=slug).first():
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    return slug

def send_email(to_email, subject, body):
    """Send email notification"""
    try:
        msg = Message()
        msg.subject = subject
        msg.recipients = [to_email]
        msg.body = body
        msg.sender = current_app.config['MAIL_DEFAULT_SENDER']
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return False

def send_notification_email(to_email, subject, message):
    """Send notification email"""
    body = f"""
    Hello,
    
    {message}
    
    You can manage your notifications and comments in the admin panel.
    
    Best regards,
    Portfolio System
    """
    
    return send_email(to_email, subject, body)

def generate_reset_token(email):
    """Generate password reset token"""
    payload = {
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    
    token = jwt.encode(
        payload,
        current_app.secret_key,
        algorithm='HS256'
    )
    
    return token

def verify_reset_token(token):
    """Verify password reset token"""
    try:
        payload = jwt.decode(
            token,
            current_app.secret_key,
            algorithms=['HS256']
        )
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def is_admin_required(f):
    """Decorator to require admin access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

def format_date(date, format='%B %d, %Y'):
    """Format date for display"""
    if date:
        return date.strftime(format)
    return ''

def truncate_text(text, length=150, suffix='...'):
    """Truncate text to specified length"""
    if len(text) <= length:
        return text
    return text[:length].rsplit(' ', 1)[0] + suffix

def get_reading_time(content):
    """Calculate estimated reading time"""
    if not content:
        return 0
    
    word_count = len(content.split())
    # Average reading speed: 200 words per minute
    reading_time = max(1, round(word_count / 200))
    return reading_time

def create_breadcrumbs(request_path):
    """Create breadcrumbs for navigation"""
    parts = request_path.strip('/').split('/')
    breadcrumbs = [{'name': 'Home', 'url': '/'}]
    
    path = ''
    for part in parts:
        if part:
            path += '/' + part
            name = part.replace('-', ' ').replace('_', ' ').title()
            breadcrumbs.append({'name': name, 'url': path})
    
    return breadcrumbs

# Template filters
def register_template_filters(app):
    """Register custom template filters"""
    
    @app.template_filter('format_date')
    def format_date_filter(date, format='%B %d, %Y'):
        return format_date(date, format)
    
    @app.template_filter('truncate_text')
    def truncate_text_filter(text, length=150):
        return truncate_text(text, length)
    
    @app.template_filter('reading_time')
    def reading_time_filter(content):
        return get_reading_time(content)
