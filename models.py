from datetime import datetime
from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    bio = db.Column(db.Text)
    professional_journey = db.Column(db.Text)  # Editable professional journey
    profile_image = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
    email_notifications = db.Column(db.Boolean, default=True)
    oauth_provider = db.Column(db.String(50))
    oauth_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    comments = db.relationship('Comment', backref='user', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='user', lazy=True, cascade='all, delete-orphan')
    
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Tag {self.name}>'

# Association table for many-to-many relationship between projects and tags
project_tags = db.Table('project_tags',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

# Association table for many-to-many relationship between achievements and tags
achievement_tags = db.Table('achievement_tags',
    db.Column('achievement_id', db.Integer, db.ForeignKey('achievement.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    video_url = db.Column(db.String(500))
    demo_url = db.Column(db.String(500))
    github_url = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=False)
    featured = db.Column(db.Boolean, default=False)
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tags = db.relationship('Tag', secondary=project_tags, lazy='subquery',
                          backref=db.backref('projects', lazy=True))
    comments = db.relationship('Comment', backref='project', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Project {self.title}>'

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    certificate_url = db.Column(db.String(500))
    date_achieved = db.Column(db.Date)
    organization = db.Column(db.String(200))
    is_published = db.Column(db.Boolean, default=False)
    featured = db.Column(db.Boolean, default=False)
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tags = db.relationship('Tag', secondary=achievement_tags, lazy='subquery',
                          backref=db.backref('achievements', lazy=True))
    comments = db.relationship('Comment', backref='achievement', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='achievement', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Achievement {self.title}>'

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_approved = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship for replies
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy=True)
    
    def __repr__(self):
        return f'<Comment {self.id} by {self.user.username}>'

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Nullable for anonymous likes
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=True)
    ip_address = db.Column(db.String(45))  # For anonymous likes tracking
    session_id = db.Column(db.String(255))  # For anonymous likes tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Ensure unique likes per user/session per content
    __table_args__ = (
        db.Index('ix_user_project_like', 'user_id', 'project_id'),
        db.Index('ix_user_achievement_like', 'user_id', 'achievement_id'),
        db.Index('ix_session_project_like', 'session_id', 'project_id'),
        db.Index('ix_session_achievement_like', 'session_id', 'achievement_id'),
    )
    
    def __repr__(self):
        return f'<Like {self.id}>'

class PasswordReset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='password_resets')
    
    def __repr__(self):
        return f'<PasswordReset {self.token}>'
