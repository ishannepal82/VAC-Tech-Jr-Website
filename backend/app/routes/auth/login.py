from flask import Blueprint, request, jsonify, make_response
import requests
import datetime
from firebase_admin import auth
from app.routes.auth.bp import auth_bp

FIREBASE_API_KEY = "AIzaSyCSY46pA55Y6JBzlOJDkVIol66lqAM9g3w"

@auth_bp.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"msg": "Email and password are required"}), 400
        
        '''Verify User Credentials with Firebase Auth REST API'''
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"

        payload = {"email": email, "password": password, "returnSecureToken": True}
        r = requests.post(url, json=payload)
        res_data = r.json()

        if "error" in res_data:
            return jsonify({"msg": res_data["error"]["message"]}), 401

        id_token = res_data["idToken"]

        '''Create a Session Cookie'''
        expires_in = datetime.timedelta(days=7)
        session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)

        response = make_response(jsonify({
            "message": "Login successful"
        }))

        response.set_cookie(
            "session",
            session_cookie,
            httponly=True,
            secure=False,       
            samesite="None",
            max_age=7 * 24 * 60 * 60,
            partitioned=True
        )

        return response

    except Exception as e:
        return jsonify({"msg": "Internal server error", "error": str(e)}), 500
