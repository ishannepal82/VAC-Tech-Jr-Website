from flask import Blueprint, request, jsonify
import requests
from app.routes.utils.user_verifier_func import get_current_user
from app.routes.auth.bp import auth_bp
from app.config import Config



@auth_bp.route('/forgotpassword', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={Config.FIREBASE_API_KEY}"
    payload = {"requestType": "PASSWORD_RESET", "email": email}
    
    res = requests.post(url, json=payload)
    result = res.json()
    
    if "error" in result:
        return jsonify({"msg": "Error sending password reset email", "error": result["error"]}), 400

    return jsonify({"msg": "Password reset email sent successfully"}), 200
