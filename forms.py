from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, PasswordField, BooleanField, SelectField, DateField, URLField, HiddenField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional, URL
from wtforms.widgets import TextArea
from models import Category, Tag, User
import re

class CKEditorWidget(TextArea):
    """Custom widget for CKEditor"""
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class', 'ckeditor')
        return super(CKEditorWidget, self).__call__(field, **kwargs)

class CKEditorField(TextAreaField):
    widget = CKEditorWidget()

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[Optional(), Length(max=50)])
    last_name = StringField('Last Name', validators=[Optional(), Length(max=50)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please choose a different one.')

class ForgotPasswordForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])

class ResetPasswordForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])

class ProfileForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[Optional(), Length(max=50)])
    last_name = StringField('Last Name', validators=[Optional(), Length(max=50)])
    bio = TextAreaField('Bio', validators=[Optional(), Length(max=1000)])
    professional_journey = CKEditorField('Professional Journey', validators=[Optional()])
    profile_image = FileField('Profile Image', validators=[Optional(), FileAllowed(['jpg', 'png', 'gif', 'jpeg'], 'Images only!')])
    email_notifications = BooleanField('Email Notifications')

class ProjectForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description', validators=[DataRequired()])
    content = CKEditorField('Content', validators=[Optional()])
    category_id = SelectField('Category', coerce=int, validators=[Optional()])
    tags = StringField('Tags (comma-separated)', validators=[Optional()])
    image = FileField('Project Image', validators=[Optional(), FileAllowed(['jpg', 'png', 'gif', 'jpeg'], 'Images only!')])
    video_url = URLField('Video URL', validators=[Optional(), URL()])
    demo_url = URLField('Demo URL', validators=[Optional(), URL()])
    github_url = URLField('GitHub URL', validators=[Optional(), URL()])
    is_published = BooleanField('Publish')
    featured = BooleanField('Featured')

    def __init__(self, *args, **kwargs):
        super(ProjectForm, self).__init__(*args, **kwargs)
        self.category_id.choices = [(0, 'No Category')] + [(c.id, c.name) for c in Category.query.all()]

class AchievementForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description', validators=[DataRequired()])
    content = CKEditorField('Content', validators=[Optional()])
    organization = StringField('Organization', validators=[Optional(), Length(max=200)])
    date_achieved = DateField('Date Achieved', validators=[Optional()])
    category_id = SelectField('Category', coerce=int, validators=[Optional()])
    tags = StringField('Tags (comma-separated)', validators=[Optional()])
    image = FileField('Achievement Image', validators=[Optional(), FileAllowed(['jpg', 'png', 'gif', 'jpeg'], 'Images only!')])
    certificate_url = URLField('Certificate URL', validators=[Optional(), URL()])
    is_published = BooleanField('Publish')
    featured = BooleanField('Featured')

    def __init__(self, *args, **kwargs):
        super(AchievementForm, self).__init__(*args, **kwargs)
        self.category_id.choices = [(0, 'No Category')] + [(c.id, c.name) for c in Category.query.all()]

class CommentForm(FlaskForm):
    content = TextAreaField('Comment', validators=[DataRequired(), Length(min=1, max=1000)])
    parent_id = HiddenField()

class CategoryForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=50)])
    description = TextAreaField('Description', validators=[Optional()])
    color = StringField('Color', validators=[Optional(), Length(max=7)])

class SearchForm(FlaskForm):
    q = StringField('Search', validators=[Optional()])
    category = SelectField('Category', coerce=int, validators=[Optional()])
    content_type = SelectField('Content Type', choices=[('all', 'All'), ('projects', 'Projects'), ('achievements', 'Achievements')], default='all')

    def __init__(self, *args, **kwargs):
        super(SearchForm, self).__init__(*args, **kwargs)
        self.category.choices = [(0, 'All Categories')] + [(c.id, c.name) for c in Category.query.all()]
