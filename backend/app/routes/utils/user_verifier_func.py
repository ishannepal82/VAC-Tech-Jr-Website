from flask import request, jsonify
import firebase_admin
from firebase_admin import auth
from functools import wraps

def get_current_user():
    """
    Reads the Firebase ID token from cookies and verifies it.
    Returns the decoded token (dict) if valid, otherwise None.
    """
    try:
        # The cookie name your frontend sets (adjust if needed)
        session_cookie = request.cookies.get('session')
        print(session_cookie)
        if not session_cookie:
            return None  # No token provided
        
        decoded_token = auth.verify_session_cookie(session_cookie, check_revoked=True)
        user = {
            "uid": decoded_token['uid'],
            "email": decoded_token['email'],
            "name": decoded_token['name'],
            "role": decoded_token['role'],
            "is_admin": decoded_token['is_admin']
        }

        return user

    except auth.ExpiredIdTokenError:
        print("⚠️ Token expired.")
        return None
    except Exception as e:
        print("⚠️ Error verifying token:", e)
        return None