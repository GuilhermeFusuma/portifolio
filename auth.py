import os
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
import requests
from urllib.parse import urlencode

from app import db, mail
from models import User
from forms import LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm
from utils import send_email, generate_reset_token, verify_reset_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            flash(f'Welcome back, {user.username}!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('index'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegisterForm()
    
    if form.validate_on_submit():
        # Check if this is the admin email
        is_admin = form.email.data.lower() == current_app.config['ADMIN_EMAIL'].lower()
        
        user = User()
        user.username = form.username.data
        user.email = form.email.data
        user.first_name = form.first_name.data
        user.last_name = form.last_name.data
        user.is_admin = is_admin
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        flash('Registration successful! Welcome to the portfolio!', 'success')
        return redirect(url_for('index'))
    
    return render_template('register.html', form=form)

@auth_bp.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Forgot password - send reset email"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = ForgotPasswordForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            token = generate_reset_token(user.email)
            reset_url = url_for('auth.reset_password', token=token, _external=True)
            
            # Send reset email
            subject = 'Password Reset Request'
            body = f'''
            Hi {user.username},
            
            You have requested to reset your password. Click the link below to reset it:
            
            {reset_url}
            
            This link will expire in 1 hour.
            
            If you did not request this, please ignore this email.
            
            Best regards,
            Portfolio Team
            '''
            
            send_email(user.email, subject, body)
            
        # Always show success message to prevent email enumeration
        flash('If an account with that email exists, a password reset link has been sent.', 'info')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/forgot_password.html', form=form)

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """Reset password with token"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    email = verify_reset_token(token)
    if not email:
        flash('Invalid or expired reset token.', 'error')
        return redirect(url_for('auth.forgot_password'))
    
    form = ResetPasswordForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(email=email).first()
        if user:
            user.set_password(form.password.data)
            db.session.commit()
            flash('Your password has been reset successfully!', 'success')
            return redirect(url_for('auth.login'))
    
    return render_template('auth/reset_password.html', form=form)

# OAuth routes
@auth_bp.route('/google')
def google_auth():
    """Initiate Google OAuth"""
    google_client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    if not google_client_id:
        flash('Google OAuth is not configured.', 'error')
        return redirect(url_for('auth.login'))
    
    redirect_uri = url_for('auth.google_callback', _external=True)
    
    params = {
        'client_id': google_client_id,
        'redirect_uri': redirect_uri,
        'scope': 'openid email profile',
        'response_type': 'code',
        'state': secrets.token_urlsafe(32)
    }
    
    session['oauth_state'] = params['state']
    
    google_auth_url = 'https://accounts.google.com/o/oauth2/auth?' + urlencode(params)
    return redirect(google_auth_url)

@auth_bp.route('/google/callback')
def google_callback():
    """Google OAuth callback"""
    if 'error' in request.args:
        flash('Google authentication failed.', 'error')
        return redirect(url_for('auth.login'))
    
    if request.args.get('state') != session.get('oauth_state'):
        flash('Invalid state parameter.', 'error')
        return redirect(url_for('auth.login'))
    
    code = request.args.get('code')
    if not code:
        flash('Authorization code not received.', 'error')
        return redirect(url_for('auth.login'))
    
    # Exchange code for token
    token_data = {
        'client_id': current_app.config['GOOGLE_CLIENT_ID'],
        'client_secret': current_app.config['GOOGLE_CLIENT_SECRET'],
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': url_for('auth.google_callback', _external=True)
    }
    
    token_response = requests.post('https://oauth2.googleapis.com/token', data=token_data)
    token_json = token_response.json()
    
    if 'access_token' not in token_json:
        flash('Failed to obtain access token.', 'error')
        return redirect(url_for('auth.login'))
    
    # Get user info
    headers = {'Authorization': f'Bearer {token_json["access_token"]}'}
    user_response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers=headers)
    user_data = user_response.json()
    
    # Find or create user
    user = User.query.filter_by(email=user_data['email']).first()
    
    if not user:
        user = User(
            username=user_data['email'].split('@')[0],
            email=user_data['email'],
            first_name=user_data.get('given_name', ''),
            last_name=user_data.get('family_name', ''),
            oauth_provider='google',
            oauth_id=user_data['id'],
            password_hash=generate_password_hash(secrets.token_urlsafe(32))  # Random password
        )
        db.session.add(user)
        db.session.commit()
        flash('Account created successfully with Google!', 'success')
    else:
        if not user.oauth_provider:
            user.oauth_provider = 'google'
            user.oauth_id = user_data['id']
            db.session.commit()
    
    login_user(user)
    return redirect(url_for('index'))

@auth_bp.route('/linkedin')
def linkedin_auth():
    """Initiate LinkedIn OAuth"""
    linkedin_client_id = current_app.config.get('LINKEDIN_CLIENT_ID')
    if not linkedin_client_id:
        flash('LinkedIn OAuth is not configured.', 'error')
        return redirect(url_for('auth.login'))
    
    redirect_uri = url_for('auth.linkedin_callback', _external=True)
    
    params = {
        'response_type': 'code',
        'client_id': linkedin_client_id,
        'redirect_uri': redirect_uri,
        'scope': 'r_liteprofile r_emailaddress',
        'state': secrets.token_urlsafe(32)
    }
    
    session['oauth_state'] = params['state']
    
    linkedin_auth_url = 'https://www.linkedin.com/oauth/v2/authorization?' + urlencode(params)
    return redirect(linkedin_auth_url)

@auth_bp.route('/linkedin/callback')
def linkedin_callback():
    """LinkedIn OAuth callback"""
    if 'error' in request.args:
        flash('LinkedIn authentication failed.', 'error')
        return redirect(url_for('auth.login'))
    
    if request.args.get('state') != session.get('oauth_state'):
        flash('Invalid state parameter.', 'error')
        return redirect(url_for('auth.login'))
    
    code = request.args.get('code')
    if not code:
        flash('Authorization code not received.', 'error')
        return redirect(url_for('auth.login'))
    
    # Exchange code for token
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': url_for('auth.linkedin_callback', _external=True),
        'client_id': current_app.config['LINKEDIN_CLIENT_ID'],
        'client_secret': current_app.config['LINKEDIN_CLIENT_SECRET']
    }
    
    token_response = requests.post('https://www.linkedin.com/oauth/v2/accessToken', data=token_data)
    token_json = token_response.json()
    
    if 'access_token' not in token_json:
        flash('Failed to obtain access token.', 'error')
        return redirect(url_for('auth.login'))
    
    # Get user info
    headers = {'Authorization': f'Bearer {token_json["access_token"]}'}
    
    # Get profile
    profile_response = requests.get('https://api.linkedin.com/v2/people/~', headers=headers)
    profile_data = profile_response.json()
    
    # Get email
    email_response = requests.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', headers=headers)
    email_data = email_response.json()
    
    email = email_data['elements'][0]['handle~']['emailAddress']
    
    # Find or create user
    user = User.query.filter_by(email=email).first()
    
    if not user:
        first_name = profile_data.get('localizedFirstName', '')
        last_name = profile_data.get('localizedLastName', '')
        
        user = User(
            username=email.split('@')[0],
            email=email,
            first_name=first_name,
            last_name=last_name,
            oauth_provider='linkedin',
            oauth_id=profile_data['id'],
            password_hash=generate_password_hash(secrets.token_urlsafe(32))
        )
        db.session.add(user)
        db.session.commit()
        flash('Account created successfully with LinkedIn!', 'success')
    else:
        if not user.oauth_provider:
            user.oauth_provider = 'linkedin'
            user.oauth_id = profile_data['id']
            db.session.commit()
    
    login_user(user)
    return redirect(url_for('index'))
