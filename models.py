from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
    email_notifications = db.Column(db.Boolean, default=True)
    oauth_provider = db.Column(db.String(50))
    oauth_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    projects = db.relationship('Project', backref='author', lazy=True)
    achievements = db.relationship('Achievement', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)
    likes = db.relationship('Like', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def __repr__(self):
        return f'<User {self.username}>'

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#6366f1')  # Purple default
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    projects = db.relationship('Project', backref='category', lazy=True)
    achievements = db.relationship('Achievement', backref='category', lazy=True)
    
    def __repr__(self):
        return f'<Category {self.name}>'

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    slug = db.Column(db.String(30), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Tag {self.name}>'

# Association table for project tags
project_tags = db.Table('project_tags',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

# Association table for achievement tags
achievement_tags = db.Table('achievement_tags',
    db.Column('achievement_id', db.Integer, db.ForeignKey('achievement.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text)
    featured_image = db.Column(db.String(200))
    demo_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    technologies = db.Column(db.Text)  # JSON string
    status = db.Column(db.String(20), default='draft')  # draft, published
    is_featured = db.Column(db.Boolean, default=False)
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    
    # Relationships
    tags = db.relationship('Tag', secondary=project_tags, lazy='subquery',
                          backref=db.backref('projects', lazy=True))
    comments = db.relationship('Comment', backref='project', lazy=True,
                              cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='project', lazy=True,
                           cascade='all, delete-orphan')
    media = db.relationship('ProjectMedia', backref='project', lazy=True,
                           cascade='all, delete-orphan')
    
    def get_like_count(self):
        return Like.query.filter_by(project_id=self.id).count()
    
    def is_liked_by(self, user):
        if not user or not user.is_authenticated:
            return False
        return Like.query.filter_by(user_id=user.id, project_id=self.id).first() is not None
    
    def __repr__(self):
        return f'<Project {self.title}>'

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text)
    image = db.Column(db.String(200))
    date_achieved = db.Column(db.Date)
    organization = db.Column(db.String(100))
    certificate_url = db.Column(db.String(200))
    status = db.Column(db.String(20), default='draft')  # draft, published
    is_featured = db.Column(db.Boolean, default=False)
    likes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    
    # Relationships
    tags = db.relationship('Tag', secondary=achievement_tags, lazy='subquery',
                          backref=db.backref('achievements', lazy=True))
    comments = db.relationship('Comment', backref='achievement', lazy=True,
                              cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='achievement', lazy=True,
                           cascade='all, delete-orphan')
    
    def get_like_count(self):
        return Like.query.filter_by(achievement_id=self.id).count()
    
    def is_liked_by(self, user):
        if not user or not user.is_authenticated:
            return False
        return Like.query.filter_by(user_id=user.id, achievement_id=self.id).first() is not None
    
    def __repr__(self):
        return f'<Achievement {self.title}>'

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'))
    
    def __repr__(self):
        return f'<Comment {self.id}>'

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))  # For anonymous likes
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # nullable for anonymous
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'))
    
    # Unique constraint to prevent duplicate likes
    __table_args__ = (
        db.UniqueConstraint('user_id', 'project_id', name='unique_user_project_like'),
        db.UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement_like'),
        db.UniqueConstraint('ip_address', 'project_id', name='unique_ip_project_like'),
        db.UniqueConstraint('ip_address', 'achievement_id', name='unique_ip_achievement_like'),
    )
    
    def __repr__(self):
        return f'<Like {self.id}>'

class ProjectMedia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    original_filename = db.Column(db.String(200), nullable=False)
    file_type = db.Column(db.String(20), nullable=False)  # image, video
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    is_featured = db.Column(db.Boolean, default=False)
    caption = db.Column(db.Text)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign key
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
    def __repr__(self):
        return f'<ProjectMedia {self.filename}>'

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # comment, like, etc.
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    related_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # User who triggered the notification
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'))
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='notifications')
    related_user = db.relationship('User', foreign_keys=[related_user_id])
    
    def __repr__(self):
        return f'<Notification {self.type} for user {self.user_id}>'
