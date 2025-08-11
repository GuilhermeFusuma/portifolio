import os
import uuid
import requests
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, flash, redirect, url_for, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
from flask_mail import Message
from werkzeug.security import generate_password_hash
from app import db, mail
from models import User, PasswordReset
from forms import LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, ProfileForm
from utils import save_uploaded_file

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            flash('Logged in successfully!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('index'))
        flash('Invalid email or password', 'error')
    return render_template('auth/login.html', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        # Check if this should be admin
        is_admin = form.email.data == current_app.config.get('ADMIN_EMAIL')
        
        user = User(
            username=form.username.data,
            email=form.email.data,
            first_name=form.first_name.data,
            last_name=form.last_name.data,
            is_admin=is_admin
        )
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/register.html', form=form)

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    form = ProfileForm(obj=current_user)
    if form.validate_on_submit():
        # Check username uniqueness
        if form.username.data != current_user.username:
            existing_user = User.query.filter_by(username=form.username.data).first()
            if existing_user:
                flash('Username already taken.', 'error')
                return render_template('auth/profile.html', form=form)
        
        # Check email uniqueness
        if form.email.data != current_user.email:
            existing_user = User.query.filter_by(email=form.email.data).first()
            if existing_user:
                flash('Email already registered.', 'error')
                return render_template('auth/profile.html', form=form)
        
        # Save profile image
        if form.profile_image.data:
            filename = save_uploaded_file(form.profile_image.data, 'profiles')
            if filename:
                current_user.profile_image = filename
        
        # Update user data
        current_user.username = form.username.data
        current_user.email = form.email.data
        current_user.first_name = form.first_name.data
        current_user.last_name = form.last_name.data
        current_user.bio = form.bio.data
        current_user.professional_journey = form.professional_journey.data
        current_user.email_notifications = form.email_notifications.data
        current_user.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('auth.profile'))
    
    return render_template('auth/profile.html', form=form)

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = ForgotPasswordForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            # Generate reset token
            token = str(uuid.uuid4())
            reset = PasswordReset(
                user_id=user.id,
                token=token,
                expires_at=datetime.utcnow() + timedelta(hours=24)
            )
            db.session.add(reset)
            db.session.commit()
            
            # Send email
            send_password_reset_email(user, token)
            
        flash('If an account with that email exists, a password reset link has been sent.', 'info')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/forgot_password.html', form=form)

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    reset = PasswordReset.query.filter_by(token=token, used=False).first()
    if not reset or reset.expires_at < datetime.utcnow():
        flash('Invalid or expired reset token.', 'error')
        return redirect(url_for('auth.forgot_password'))
    
    form = ResetPasswordForm()
    if form.validate_on_submit():
        user = reset.user
        user.set_password(form.password.data)
        reset.used = True
        db.session.commit()
        
        flash('Password has been reset successfully!', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/reset_password.html', form=form)

@auth_bp.route('/google')
def google_auth():
    # Google OAuth implementation would go here
    # For now, redirect to login with a message
    flash('Google OAuth not configured. Please use email login.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/linkedin')
def linkedin_auth():
    # LinkedIn OAuth implementation would go here
    # For now, redirect to login with a message
    flash('LinkedIn OAuth not configured. Please use email login.', 'info')
    return redirect(url_for('auth.login'))

def send_password_reset_email(user, token):
    """Send password reset email"""
    try:
        reset_url = url_for('auth.reset_password', token=token, _external=True)
        subject = 'Password Reset Request'
        body = f'''Hello {user.full_name},

You have requested a password reset for your account.

Click the following link to reset your password:
{reset_url}

This link will expire in 24 hours.

If you did not request this password reset, please ignore this email.

Best regards,
Portfolio Team
'''
        
        msg = Message(
            subject=subject,
            recipients=[user.email],
            body=body
        )
        mail.send(msg)
        current_app.logger.info(f"Password reset email sent to {user.email}")
    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email: {str(e)}")
