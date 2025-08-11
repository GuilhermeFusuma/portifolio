import os
from flask import render_template, request, flash, redirect, url_for, jsonify, session, current_app, send_from_directory
from flask_login import login_required, current_user
from sqlalchemy import or_, and_
from app import app, db
from models import Project, Achievement, Category, Tag, Comment, Like, User
from forms import ProjectForm, AchievementForm, CommentForm, CategoryForm, SearchForm
from utils import save_uploaded_file, admin_required, get_client_ip
from auth import auth_bp

# Register blueprints
app.register_blueprint(auth_bp)

@app.route('/')
def index():
    # Get featured projects and achievements
    featured_projects = Project.query.filter_by(is_published=True, featured=True).limit(3).all()
    featured_achievements = Achievement.query.filter_by(is_published=True, featured=True).limit(3).all()
    
    # Get recent projects
    recent_projects = Project.query.filter_by(is_published=True).order_by(Project.created_at.desc()).limit(6).all()
    
    return render_template('index.html', 
                         featured_projects=featured_projects,
                         featured_achievements=featured_achievements,
                         recent_projects=recent_projects)

@app.route('/about')
def about():
    return render_template('portfolio/about.html')

@app.route('/projects')
def projects():
    search_form = SearchForm()
    
    # Base query
    query = Project.query.filter_by(is_published=True)
    
    # Apply filters
    search_query = request.args.get('q', '').strip()
    category_id = request.args.get('category', type=int)
    
    if search_query:
        query = query.filter(or_(
            Project.title.contains(search_query),
            Project.description.contains(search_query),
            Project.content.contains(search_query)
        ))
    
    if category_id and category_id > 0:
        query = query.filter_by(category_id=category_id)
    
    # Order by featured first, then by creation date
    projects = query.order_by(Project.featured.desc(), Project.created_at.desc()).all()
    
    categories = Category.query.all()
    return render_template('portfolio/projects.html', 
                         projects=projects, 
                         categories=categories,
                         search_form=search_form,
                         current_search=search_query,
                         current_category=category_id)

@app.route('/projects/<int:id>')
def project_detail(id):
    project = Project.query.get_or_404(id)
    if not project.is_published and not (current_user.is_authenticated and current_user.is_admin):
        flash('Project not found.', 'error')
        return redirect(url_for('projects'))
    
    # Increment view count
    project.views_count += 1
    db.session.commit()
    
    # Get comments
    comments = Comment.query.filter_by(project_id=id, is_approved=True, parent_id=None).order_by(Comment.created_at.desc()).all()
    
    # Check if user has liked this project
    user_liked = False
    if current_user.is_authenticated:
        user_liked = Like.query.filter_by(user_id=current_user.id, project_id=id).first() is not None
    else:
        # Check by session for anonymous users
        session_id = session.get('session_id')
        if session_id:
            user_liked = Like.query.filter_by(session_id=session_id, project_id=id).first() is not None
    
    comment_form = CommentForm()
    return render_template('portfolio/project_detail.html', 
                         project=project, 
                         comments=comments, 
                         comment_form=comment_form,
                         user_liked=user_liked)

@app.route('/achievements')
def achievements():
    search_form = SearchForm()
    
    # Base query
    query = Achievement.query.filter_by(is_published=True)
    
    # Apply filters
    search_query = request.args.get('q', '').strip()
    category_id = request.args.get('category', type=int)
    
    if search_query:
        query = query.filter(or_(
            Achievement.title.contains(search_query),
            Achievement.description.contains(search_query),
            Achievement.content.contains(search_query)
        ))
    
    if category_id and category_id > 0:
        query = query.filter_by(category_id=category_id)
    
    # Order by featured first, then by date achieved
    achievements = query.order_by(Achievement.featured.desc(), Achievement.date_achieved.desc()).all()
    
    categories = Category.query.all()
    return render_template('portfolio/achievements.html', 
                         achievements=achievements, 
                         categories=categories,
                         search_form=search_form,
                         current_search=search_query,
                         current_category=category_id)

@app.route('/achievements/<int:id>')
def achievement_detail(id):
    achievement = Achievement.query.get_or_404(id)
    if not achievement.is_published and not (current_user.is_authenticated and current_user.is_admin):
        flash('Achievement not found.', 'error')
        return redirect(url_for('achievements'))
    
    # Increment view count
    achievement.views_count += 1
    db.session.commit()
    
    # Get comments
    comments = Comment.query.filter_by(achievement_id=id, is_approved=True, parent_id=None).order_by(Comment.created_at.desc()).all()
    
    # Check if user has liked this achievement
    user_liked = False
    if current_user.is_authenticated:
        user_liked = Like.query.filter_by(user_id=current_user.id, achievement_id=id).first() is not None
    else:
        # Check by session for anonymous users
        session_id = session.get('session_id')
        if session_id:
            user_liked = Like.query.filter_by(session_id=session_id, achievement_id=id).first() is not None
    
    comment_form = CommentForm()
    return render_template('portfolio/achievement_detail.html', 
                         achievement=achievement, 
                         comments=comments, 
                         comment_form=comment_form,
                         user_liked=user_liked)

@app.route('/like/<content_type>/<int:content_id>', methods=['POST'])
def toggle_like(content_type, content_id):
    if content_type not in ['project', 'achievement']:
        return jsonify({'error': 'Invalid content type'}), 400
    
    # Get or create session ID for anonymous users
    if not session.get('session_id'):
        session['session_id'] = os.urandom(16).hex()
    
    # Find the content
    if content_type == 'project':
        content = Project.query.get_or_404(content_id)
        like_filter = {'project_id': content_id}
    else:
        content = Achievement.query.get_or_404(content_id)
        like_filter = {'achievement_id': content_id}
    
    # Check existing like
    if current_user.is_authenticated:
        like_filter['user_id'] = current_user.id
        existing_like = Like.query.filter_by(**like_filter).first()
    else:
        like_filter['session_id'] = session['session_id']
        existing_like = Like.query.filter_by(**like_filter).first()
    
    if existing_like:
        # Remove like
        db.session.delete(existing_like)
        content.likes_count = max(0, content.likes_count - 1)
        liked = False
    else:
        # Add like
        like_data = like_filter.copy()
        like_data['ip_address'] = get_client_ip()
        like = Like(**like_data)
        db.session.add(like)
        content.likes_count += 1
        liked = True
    
    db.session.commit()
    
    return jsonify({
        'liked': liked,
        'likes_count': content.likes_count
    })

@app.route('/comment/<content_type>/<int:content_id>', methods=['POST'])
@login_required
def add_comment(content_type, content_id):
    if content_type not in ['project', 'achievement']:
        flash('Invalid content type', 'error')
        return redirect(url_for('index'))
    
    form = CommentForm()
    if form.validate_on_submit():
        comment_data = {
            'content': form.content.data,
            'user_id': current_user.id,
            'is_approved': True  # Auto-approve for now, can be changed for moderation
        }
        
        if content_type == 'project':
            comment_data['project_id'] = content_id
            redirect_url = url_for('project_detail', id=content_id)
        else:
            comment_data['achievement_id'] = content_id
            redirect_url = url_for('achievement_detail', id=content_id)
        
        if form.parent_id.data:
            comment_data['parent_id'] = form.parent_id.data
        
        comment = Comment(**comment_data)
        db.session.add(comment)
        db.session.commit()
        
        flash('Comment added successfully!', 'success')
        
        # TODO: Send email notification to admin if enabled
        
    return redirect(redirect_url)

# Admin routes
@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    # Get statistics
    stats = {
        'total_projects': Project.query.count(),
        'published_projects': Project.query.filter_by(is_published=True).count(),
        'total_achievements': Achievement.query.count(),
        'published_achievements': Achievement.query.filter_by(is_published=True).count(),
        'total_users': User.query.count(),
        'total_comments': Comment.query.count(),
        'pending_comments': Comment.query.filter_by(is_approved=False).count()
    }
    
    # Recent activity
    recent_projects = Project.query.order_by(Project.created_at.desc()).limit(5).all()
    recent_comments = Comment.query.order_by(Comment.created_at.desc()).limit(5).all()
    
    return render_template('admin/dashboard.html', 
                         stats=stats,
                         recent_projects=recent_projects,
                         recent_comments=recent_comments)

@app.route('/admin/projects')
@login_required
@admin_required
def admin_projects():
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return render_template('admin/projects_list.html', projects=projects, content_type='projects')

@app.route('/admin/achievements')
@login_required
@admin_required
def admin_achievements():
    achievements = Achievement.query.order_by(Achievement.created_at.desc()).all()
    return render_template('admin/projects_list.html', projects=achievements, content_type='achievements')

@app.route('/admin/project/new', methods=['GET', 'POST'])
@app.route('/admin/project/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_project_form(id=None):
    project = Project.query.get(id) if id else None
    form = ProjectForm(obj=project)
    
    if form.validate_on_submit():
        if not project:
            project = Project()
            db.session.add(project)
        
        # Save uploaded image
        if form.image.data:
            filename = save_uploaded_file(form.image.data, 'projects')
            if filename:
                project.image_url = filename
        
        # Update project data
        form.populate_obj(project)
        
        # Handle tags
        if form.tags.data:
            tag_names = [name.strip().lower() for name in form.tags.data.split(',') if name.strip()]
            project.tags.clear()
            for tag_name in tag_names:
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                project.tags.append(tag)
        
        if form.category_id.data == 0:
            project.category_id = None
        
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        flash('Project saved successfully!', 'success')
        return redirect(url_for('admin_projects'))
    
    return render_template('admin/project_form.html', form=form, project=project, content_type='project')

@app.route('/admin/achievement/new', methods=['GET', 'POST'])
@app.route('/admin/achievement/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_achievement_form(id=None):
    achievement = Achievement.query.get(id) if id else None
    form = AchievementForm(obj=achievement)
    
    if form.validate_on_submit():
        if not achievement:
            achievement = Achievement()
            db.session.add(achievement)
        
        # Save uploaded image
        if form.image.data:
            filename = save_uploaded_file(form.image.data, 'achievements')
            if filename:
                achievement.image_url = filename
        
        # Update achievement data
        form.populate_obj(achievement)
        
        # Handle tags
        if form.tags.data:
            tag_names = [name.strip().lower() for name in form.tags.data.split(',') if name.strip()]
            achievement.tags.clear()
            for tag_name in tag_names:
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                achievement.tags.append(tag)
        
        if form.category_id.data == 0:
            achievement.category_id = None
        
        achievement.updated_at = datetime.utcnow()
        db.session.commit()
        
        flash('Achievement saved successfully!', 'success')
        return redirect(url_for('admin_achievements'))
    
    return render_template('admin/project_form.html', form=form, project=achievement, content_type='achievement')

@app.route('/admin/project/<int:id>/delete', methods=['POST'])
@app.route('/admin/achievement/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def admin_delete_content(id):
    content_type = request.endpoint.split('_')[1]  # Extract 'project' or 'achievement'
    
    if content_type == 'project':
        content = Project.query.get_or_404(id)
        redirect_url = url_for('admin_projects')
    else:
        content = Achievement.query.get_or_404(id)
        redirect_url = url_for('admin_achievements')
    
    db.session.delete(content)
    db.session.commit()
    
    flash(f'{content_type.title()} deleted successfully!', 'success')
    return redirect(redirect_url)

@app.route('/admin/comments')
@login_required
@admin_required
def admin_comments():
    comments = Comment.query.order_by(Comment.created_at.desc()).all()
    return render_template('admin/comments_moderation.html', comments=comments)

@app.route('/admin/comment/<int:id>/approve', methods=['POST'])
@login_required
@admin_required
def admin_approve_comment(id):
    comment = Comment.query.get_or_404(id)
    comment.is_approved = True
    db.session.commit()
    flash('Comment approved!', 'success')
    return redirect(url_for('admin_comments'))

@app.route('/admin/comment/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def admin_delete_comment(id):
    comment = Comment.query.get_or_404(id)
    db.session.delete(comment)
    db.session.commit()
    flash('Comment deleted!', 'success')
    return redirect(url_for('admin_comments'))

# File serving
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# LinkedIn share
@app.route('/share/linkedin/<content_type>/<int:content_id>')
def linkedin_share(content_type, content_id):
    if content_type == 'project':
        content = Project.query.get_or_404(content_id)
        url = url_for('project_detail', id=content_id, _external=True)
    else:
        content = Achievement.query.get_or_404(content_id)
        url = url_for('achievement_detail', id=content_id, _external=True)
    
    # LinkedIn sharing URL
    linkedin_url = f"https://www.linkedin.com/sharing/share-offsite/?url={url}"
    return redirect(linkedin_url)

@app.before_request
def before_request():
    # Create session ID for anonymous users
    if not session.get('session_id'):
        session['session_id'] = os.urandom(16).hex()

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
