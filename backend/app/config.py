import dotenv
import os

dotenv.load_dotenv()
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY', 'your_firebase_api_key')
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'your_cloud_name')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', 'your_api_key')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'your_api_secret')