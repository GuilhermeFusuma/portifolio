import os
import json
from datetime import datetime
from flask import render_template, request, redirect, url_for, flash, jsonify, abort, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from sqlalchemy import or_, desc
from urllib.parse import quote

from app import app, db
from models import User, Project, Achievement, Category, Tag, Comment, Like, ProjectMedia, Notification
from forms import ProjectForm, AchievementForm, CommentForm, ProfileForm
from utils import allowed_file, get_file_type, create_slug, send_notification_email, is_admin_required
from auth import auth_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route('/')
def index():
    """Homepage with featured projects and achievements"""
    featured_projects = Project.query.filter_by(status='published', is_featured=True).limit(3).all()
    featured_achievements = Achievement.query.filter_by(status='published', is_featured=True).limit(3).all()
    recent_projects = Project.query.filter_by(status='published').order_by(desc(Project.created_at)).limit(6).all()
    
    return render_template('index.html', 
                         featured_projects=featured_projects,
                         featured_achievements=featured_achievements,
                         recent_projects=recent_projects)

@app.route('/about')
def about():
    """About page"""
    # Get admin user info for about page
    admin_user = User.query.filter_by(email=current_app.config['ADMIN_EMAIL']).first()
    return render_template('about.html', admin_user=admin_user)

@app.route('/projects')
def projects():
    """Projects listing page with filtering"""
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category', type=int)
    tag_slug = request.args.get('tag')
    search = request.args.get('search', '')
    
    query = Project.query.filter_by(status='published')
    
    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if tag_slug:
        tag = Tag.query.filter_by(slug=tag_slug).first()
        if tag:
            query = query.filter(Project.tags.contains(tag))
    
    if search:
        query = query.filter(or_(
            Project.title.contains(search),
            Project.description.contains(search),
            Project.technologies.contains(search)
        ))
    
    projects = query.order_by(desc(Project.created_at)).paginate(
        page=page, per_page=9, error_out=False
    )
    
    categories = Category.query.all()
    tags = Tag.query.all()
    
    return render_template('projects.html', 
                         projects=projects, 
                         categories=categories,
                         tags=tags,
                         current_category=category_id,
                         current_tag=tag_slug,
                         search=search)

@app.route('/project/<slug>')
def project_detail(slug):
    """Individual project detail page"""
    project = Project.query.filter_by(slug=slug, status='published').first_or_404()
    
    # Increment view count
    project.views_count += 1
    db.session.commit()
    
    # Get comments
    comments = Comment.query.filter_by(project_id=project.id, is_approved=True)\
                          .order_by(desc(Comment.created_at)).all()
    
    # Related projects
    related_projects = Project.query.filter(
        Project.id != project.id,
        Project.category_id == project.category_id,
        Project.status == 'published'
    ).limit(3).all()
    
    comment_form = CommentForm()
    
    return render_template('project_detail.html', 
                         project=project, 
                         comments=comments,
                         related_projects=related_projects,
                         comment_form=comment_form)

@app.route('/project/<slug>/like', methods=['POST'])
def like_project(slug):
    """Like/unlike a project"""
    project = Project.query.filter_by(slug=slug).first_or_404()
    
    # Check if already liked
    if current_user.is_authenticated:
        existing_like = Like.query.filter_by(user_id=current_user.id, project_id=project.id).first()
        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return jsonify({'status': 'unliked', 'count': project.get_like_count()})
        else:
            like = Like()
            like.user_id = current_user.id
            like.project_id = project.id
    else:
        # Anonymous like based on IP
        ip_address = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
        existing_like = Like.query.filter_by(ip_address=ip_address, project_id=project.id).first()
        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return jsonify({'status': 'unliked', 'count': project.get_like_count()})
        else:
            like = Like()
            like.ip_address = ip_address
            like.project_id = project.id
    
    db.session.add(like)
    db.session.commit()
    
    return jsonify({'status': 'liked', 'count': project.get_like_count()})

@app.route('/project/<slug>/comment', methods=['POST'])
@login_required
def add_comment(slug):
    """Add comment to project"""
    project = Project.query.filter_by(slug=slug).first_or_404()
    form = CommentForm()
    
    if form.validate_on_submit():
        comment = Comment()
        comment.content = form.content.data
        comment.user_id = current_user.id
        comment.project_id = project.id
        comment.is_approved = False  # Require admin approval
        db.session.add(comment)
        db.session.commit()
        
        # Create notification for admin
        admin_user = User.query.filter_by(email=current_app.config['ADMIN_EMAIL']).first()
        if admin_user and admin_user.email_notifications:
            notification = Notification()
            notification.type = 'comment'
            notification.message = f'New comment on project "{project.title}"'
            notification.user_id = admin_user.id
            notification.related_user_id = current_user.id
            notification.project_id = project.id
            notification.comment_id = comment.id
            db.session.add(notification)
            db.session.commit()
            
            # Send email notification
            send_notification_email(admin_user.email, 'New Comment', 
                                   f'{current_user.username} commented on "{project.title}"')
        
        flash('Your comment has been submitted and is awaiting approval.', 'success')
    else:
        flash('Please check your comment and try again.', 'error')
    
    return redirect(url_for('project_detail', slug=slug))

@app.route('/achievements')
def achievements():
    """Achievements listing page"""
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category', type=int)
    
    query = Achievement.query.filter_by(status='published')
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    achievements = query.order_by(desc(Achievement.date_achieved)).paginate(
        page=page, per_page=12, error_out=False
    )
    
    categories = Category.query.all()
    
    return render_template('achievements.html', 
                         achievements=achievements, 
                         categories=categories,
                         current_category=category_id)

@app.route('/profile')
@login_required
def profile():
    """User profile page"""
    form = ProfileForm(obj=current_user)
    return render_template('profile.html', form=form)

@app.route('/profile', methods=['POST'])
@login_required
def update_profile():
    """Update user profile"""
    form = ProfileForm()
    
    if form.validate_on_submit():
        current_user.first_name = form.first_name.data
        current_user.last_name = form.last_name.data
        current_user.bio = form.bio.data
        current_user.email_notifications = form.email_notifications.data
        
        # Handle profile image upload
        if form.profile_image.data:
            file = form.profile_image.data
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                current_user.profile_image = filename
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    return render_template('profile.html', form=form)

# Admin routes
@app.route('/admin')
@login_required
@is_admin_required
def admin_dashboard():
    """Admin dashboard"""
    total_projects = Project.query.count()
    total_achievements = Achievement.query.count()
    total_comments = Comment.query.count()
    pending_comments = Comment.query.filter_by(is_approved=False).count()
    
    recent_projects = Project.query.order_by(desc(Project.created_at)).limit(5).all()
    recent_comments = Comment.query.filter_by(is_approved=False)\
                               .order_by(desc(Comment.created_at)).limit(5).all()
    
    stats = {
        'total_projects': total_projects,
        'total_achievements': total_achievements,
        'total_comments': total_comments,
        'pending_comments': pending_comments
    }
    
    return render_template('admin/dashboard.html', 
                         stats=stats,
                         recent_projects=recent_projects,
                         recent_comments=recent_comments)

@app.route('/admin/projects')
@login_required
@is_admin_required
def admin_projects():
    """Admin projects management"""
    page = request.args.get('page', 1, type=int)
    projects = Project.query.order_by(desc(Project.created_at)).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template('admin/projects.html', projects=projects)

@app.route('/admin/project/new', methods=['GET', 'POST'])
@login_required
@is_admin_required
def admin_new_project():
    """Create new project"""
    form = ProjectForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    
    if form.validate_on_submit():
        # Create slug
        slug = create_slug(form.title.data, Project)
        
        project = Project(
            title=form.title.data,
            slug=slug,
            description=form.description.data,
            content=form.content.data,
            demo_url=form.demo_url.data,
            github_url=form.github_url.data,
            technologies=json.dumps(form.technologies.data.split(',') if form.technologies.data else []),
            status=form.status.data,
            is_featured=form.is_featured.data,
            category_id=form.category_id.data if form.category_id.data else None,
            user_id=current_user.id
        )
        
        # Handle featured image upload
        if form.featured_image.data:
            file = form.featured_image.data
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                project.featured_image = filename
        
        db.session.add(project)
        db.session.commit()
        
        # Handle tags
        if form.tags.data:
            tag_names = [tag.strip() for tag in form.tags.data.split(',')]
            for tag_name in tag_names:
                if tag_name:
                    tag_slug = create_slug(tag_name, Tag)
                    tag = Tag.query.filter_by(slug=tag_slug).first()
                    if not tag:
                        tag = Tag(name=tag_name, slug=tag_slug)
                        db.session.add(tag)
                    project.tags.append(tag)
        
        db.session.commit()
        flash('Project created successfully!', 'success')
        return redirect(url_for('admin_projects'))
    
    return render_template('admin/project_form.html', form=form, title='New Project')

@app.route('/admin/project/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@is_admin_required
def admin_edit_project(id):
    """Edit existing project"""
    project = Project.query.get_or_404(id)
    form = ProjectForm(obj=project)
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    
    # Populate form with existing data
    if request.method == 'GET':
        form.technologies.data = ', '.join(json.loads(project.technologies or '[]'))
        form.tags.data = ', '.join([tag.name for tag in project.tags])
    
    if form.validate_on_submit():
        project.title = form.title.data
        project.description = form.description.data
        project.content = form.content.data
        project.demo_url = form.demo_url.data
        project.github_url = form.github_url.data
        project.technologies = json.dumps(form.technologies.data.split(',') if form.technologies.data else [])
        project.status = form.status.data
        project.is_featured = form.is_featured.data
        project.category_id = form.category_id.data if form.category_id.data else None
        project.updated_at = datetime.utcnow()
        
        # Handle featured image upload
        if form.featured_image.data:
            file = form.featured_image.data
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                project.featured_image = filename
        
        # Handle tags
        project.tags.clear()
        if form.tags.data:
            tag_names = [tag.strip() for tag in form.tags.data.split(',')]
            for tag_name in tag_names:
                if tag_name:
                    tag_slug = create_slug(tag_name, Tag)
                    tag = Tag.query.filter_by(slug=tag_slug).first()
                    if not tag:
                        tag = Tag(name=tag_name, slug=tag_slug)
                        db.session.add(tag)
                    project.tags.append(tag)
        
        db.session.commit()
        flash('Project updated successfully!', 'success')
        return redirect(url_for('admin_projects'))
    
    return render_template('admin/project_form.html', form=form, project=project, title='Edit Project')

@app.route('/admin/project/<int:id>/delete', methods=['POST'])
@login_required
@is_admin_required
def admin_delete_project(id):
    """Delete project"""
    project = Project.query.get_or_404(id)
    
    # Delete associated files
    if project.featured_image:
        try:
            os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], project.featured_image))
        except:
            pass
    
    db.session.delete(project)
    db.session.commit()
    flash('Project deleted successfully!', 'success')
    return redirect(url_for('admin_projects'))

@app.route('/admin/achievements')
@login_required
@is_admin_required
def admin_achievements():
    """Admin achievements management"""
    page = request.args.get('page', 1, type=int)
    achievements = Achievement.query.order_by(desc(Achievement.created_at)).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template('admin/achievements.html', achievements=achievements)

@app.route('/admin/achievement/new', methods=['GET', 'POST'])
@login_required
@is_admin_required
def admin_new_achievement():
    """Create new achievement"""
    form = AchievementForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    
    if form.validate_on_submit():
        slug = create_slug(form.title.data, Achievement)
        
        achievement = Achievement(
            title=form.title.data,
            slug=slug,
            description=form.description.data,
            content=form.content.data,
            date_achieved=form.date_achieved.data,
            organization=form.organization.data,
            certificate_url=form.certificate_url.data,
            status=form.status.data,
            is_featured=form.is_featured.data,
            category_id=form.category_id.data if form.category_id.data else None,
            user_id=current_user.id
        )
        
        # Handle image upload
        if form.image.data:
            file = form.image.data
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                achievement.image = filename
        
        db.session.add(achievement)
        db.session.commit()
        
        # Handle tags
        if form.tags.data:
            tag_names = [tag.strip() for tag in form.tags.data.split(',')]
            for tag_name in tag_names:
                if tag_name:
                    tag_slug = create_slug(tag_name, Tag)
                    tag = Tag.query.filter_by(slug=tag_slug).first()
                    if not tag:
                        tag = Tag(name=tag_name, slug=tag_slug)
                        db.session.add(tag)
                    achievement.tags.append(tag)
        
        db.session.commit()
        flash('Achievement created successfully!', 'success')
        return redirect(url_for('admin_achievements'))
    
    return render_template('admin/achievement_form.html', form=form, title='New Achievement')

@app.route('/admin/comments')
@login_required
@is_admin_required
def admin_comments():
    """Admin comments management"""
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', 'pending')
    
    if status == 'pending':
        comments = Comment.query.filter_by(is_approved=False)
    elif status == 'approved':
        comments = Comment.query.filter_by(is_approved=True)
    else:
        comments = Comment.query
    
    comments = comments.order_by(desc(Comment.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/comments.html', comments=comments, current_status=status)

@app.route('/admin/comment/<int:id>/approve', methods=['POST'])
@login_required
@is_admin_required
def admin_approve_comment(id):
    """Approve comment"""
    comment = Comment.query.get_or_404(id)
    comment.is_approved = True
    db.session.commit()
    flash('Comment approved!', 'success')
    return redirect(url_for('admin_comments'))

@app.route('/admin/comment/<int:id>/delete', methods=['POST'])
@login_required
@is_admin_required
def admin_delete_comment(id):
    """Delete comment"""
    comment = Comment.query.get_or_404(id)
    db.session.delete(comment)
    db.session.commit()
    flash('Comment deleted!', 'success')
    return redirect(url_for('admin_comments'))

@app.route('/share/linkedin/<content_type>/<int:content_id>')
def linkedin_share(content_type, content_id):
    """Generate LinkedIn share URL with custom preview"""
    if content_type == 'project':
        content = Project.query.get_or_404(content_id)
        url = url_for('project_detail', slug=content.slug, _external=True)
    elif content_type == 'achievement':
        content = Achievement.query.get_or_404(content_id)
        url = url_for('achievements', _external=True)  # or specific achievement page
    else:
        abort(404)
    
    # LinkedIn share URL
    linkedin_url = f"https://www.linkedin.com/sharing/share-offsite/?url={quote(url)}"
    
    return redirect(linkedin_url)

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    flash('File too large. Please upload a smaller file.', 'error')
    return redirect(request.url)

# Context processors
@app.context_processor
def inject_globals():
    """Inject global variables into templates"""
    return {
        'categories': Category.query.all(),
        'current_year': datetime.now().year
    }
