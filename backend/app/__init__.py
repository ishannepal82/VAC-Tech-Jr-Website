from flask import Flask
from firebase_admin import firestore, credentials, initialize_app
from flask_cors import CORS
import cloudinary
from app.config import Config

db = None
'''Initialzing Firebase app'''
cred = credentials.Certificate('supersecret.json')
initialize_app(cred)
db = firestore.client()

def create_app():
    app = Flask(__name__)

    '''Initializing Imagekit App'''
    # SDK initialization
    cloudinary.config(
        cloud_name = Config.CLOUDINARY_CLOUD_NAME,
        api_key = Config.CLOUDINARY_API_KEY,
        api_secret = Config.CLOUDINARY_API_SECRET,
        secure = True  # Always use HTTPS URLs
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
    app.register_blueprint(events_bp, url_prefix='/api/events')

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

    from app.routes.services.manage_bod import bod_bp
    app.register_blueprint(bod_bp, url_prefix='/api/bod')

    from app.routes.services.manage_community import community_bp
    app.register_blueprint(community_bp, url_prefix='/api/community')

    from app.routes.services.manage_workshops import workshops_bp
    app.register_blueprint(workshops_bp, url_prefix='/api/workshops')

    from app.routes.services.manage_posts import posts_bp
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    
    return app