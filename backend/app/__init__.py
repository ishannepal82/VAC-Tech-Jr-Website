from flask import Flask
from firebase_admin import firestore, credentials, initialize_app
import cloudinary
from flask_cors import CORS

db = None
'''Initialzing Firebase app'''
cred = credentials.Certificate('supersecret.json')
initialize_app(cred)
db = firestore.client()

def create_app():
    app = Flask(__name__)

    '''Initializing Cloudinary App'''
    cloudinary.config(
        cloud_name="do9ertejv",
        api_key="959525144626746",
        api_secret="q8tDQ2d7hzfI6A05QLlwP8m-rKQ",
        secure=True
    )

    '''Enabling Flask CORS to the app'''
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    '''Attaching DB Config'''
    app.config['db'] = db


    '''Registering Auth Blueprint'''
    from app.routes.auth.bp import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    '''Registering Services Blueprint'''
    from app.routes.services.manage_events import events_bp
    app.register_blueprint(events_bp, url_prefix='/api')

    from app.routes.services.leaderboard import leaderboard_bp
    app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')

    from app.routes.services.manage_gallery import gallery_bp
    app.register_blueprint(gallery_bp, url_prefix='/api/gallery')

    from app.routes.services.manage_projects import projects_bp
    app.register_blueprint(projects_bp, url_prefix='/api/projects')

    from app.routes.services.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    from app.routes.services.manage_news import news_bp
    app.register_blueprint(news_bp, url_prefix='/api/news')

    from app.routes.services.manage_users import users_bp
    app.register_blueprint(users_bp, url_prefix='/api/users')

    from app.routes.services.notifications import notifications_bp
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    return app