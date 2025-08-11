import os
import uuid
from functools import wraps
from datetime import datetime
from flask import request, current_app, flash, redirect, url_for
from flask_login import current_user
from werkzeug.utils import secure_filename
from PIL import Image

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Admin access required.', 'error')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

def get_client_ip():
    """Get client IP address"""
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        return request.environ['REMOTE_ADDR']
    else:
        return request.environ['HTTP_X_FORWARDED_FOR']

def allowed_file(filename, allowed_extensions=None):
    """Check if file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'mov', 'avi'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_uploaded_file(file, subfolder=''):
    """Save uploaded file and return filename"""
    if not file or not allowed_file(file.filename):
        return None
    
    # Generate unique filename
    filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
    
    # Create subfolder if specified
    upload_path = current_app.config['UPLOAD_FOLDER']
    if subfolder:
        upload_path = os.path.join(upload_path, subfolder)
        os.makedirs(upload_path, exist_ok=True)
    
    file_path = os.path.join(upload_path, filename)
    
    try:
        # Save file
        file.save(file_path)
        
        # If it's an image, create thumbnail and optimize
        if file.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}:
            optimize_image(file_path)
        
        # Return relative path for database storage
        if subfolder:
            return f"{subfolder}/{filename}"
        return filename
        
    except Exception as e:
        current_app.logger.error(f"Error saving file: {str(e)}")
        return None

def optimize_image(file_path, max_size=(1200, 1200), quality=85):
    """Optimize uploaded image"""
    try:
        with Image.open(file_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            
            # Resize if too large
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized version
            img.save(file_path, 'JPEG', quality=quality, optimize=True)
            
    except Exception as e:
        current_app.logger.error(f"Error optimizing image: {str(e)}")

def format_datetime(dt, format='%B %d, %Y'):
    """Format datetime for display"""
    if dt:
        return dt.strftime(format)
    return ''

def truncate_text(text, length=150):
    """Truncate text to specified length"""
    if not text:
        return ''
    if len(text) <= length:
        return text
    return text[:length].rsplit(' ', 1)[0] + '...'

class MomentJS:
    """Simple moment-like class for template functions"""
    def year(self):
        return datetime.now().year

def moment():
    """Template function to get current moment"""
    return MomentJS()

# Template filters and functions
def register_template_filters(app):
    """Register custom template filters and functions"""
    app.jinja_env.filters['datetime'] = format_datetime
    app.jinja_env.filters['truncate_text'] = truncate_text
    app.jinja_env.globals['moment'] = moment
