from flask import Blueprint, jsonify, request, current_app
from werkzeug.security import check_password_hash
from firebase_admin import auth
from app.routes.utils.user_verifier_func import get_current_user
from app.routes.auth.bp import auth_bp

@auth_bp.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        email = data.get('email', None)
        password = data.get('password',None)
        username = data.get('username', None)

        if not email or not password or not username:
            return jsonify({'msg': 'Email, password and Name are required'}), 400
        
        user = auth.create_user(
            email=email,
            password=password,
            display_name=username
        )
        uid = user.uid

        auth.set_custom_user_claims(uid, {'role': 'President', 'is_admin': True})
        db = current_app.config['db']
        user_ref = db.collection('Users').document(uid)

        if user_ref.get().exists:
            return jsonify({'msg': 'User already exists'}), 400
        
        user_ref.set({
            'email': email,
            'name': username,
            'role': 'president',
            'rank': 'Hacker',
            'points': 0,
            'committee': 'HOD',
            'memo_tokens': 0
        })

        return jsonify({'msg': 'User registered sucessfully'}), 201
    
    except Exception as e:
        if "EMAIL_EXISTS" in str(e):
            return jsonify({'msg': 'A user with this email already exists.'}), 409

        return jsonify({'msg': f'Error registering user: {str(e)}'}), 500
    
        





