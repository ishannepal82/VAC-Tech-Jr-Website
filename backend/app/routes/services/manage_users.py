from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from app.routes.utils.user_rank_checker import user_rank_checker
from firebase_admin import auth

users_bp = Blueprint('users', __name__)

@users_bp.route('/get-all-users', methods=['GET'])
def get_all_users():
    try:
        db = current_app.config['db']

        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        users_ref = db.collection('Users')
        users = [doc.to_dict() | {"id": doc.id} for doc in users_ref.stream()]

        return jsonify({
            'msg': 'Successfully fetched users',
            'users': users
        }), 200

    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
@users_bp.route('/add-user', methods=['POST'])
def add_user():
    try:
        db = current_app.config['db']
        data = request.get_json()

        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400
        
        required_fields = ["email", "password", "committee", "role", "name"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        user = get_current_user()
        if not user or not user['is_admin']:
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        user = auth.create_user(
            email=data.get('email'),
            password= data.get('password'),
            display_name= data.get('name')
        )

        uid = user.uid
        auth.set_custom_user_claims(uid, {'is_admin': data.get('is_admin', False)})
        
        users_ref = db.collection('Users').document(uid)
        users_ref.set({
            'name': data.get('name'),
            'memo_tokens': data.get('memo_tokens'),
            'points': 0,
            'role': data.get('role'),
            'committee': data.get('committee'),
            'is_admin': data.get('is_admin', False),
            'rank': 'Newbie',
            'email': data.get('email'),
            'workshops': []
        })

        return jsonify({
            'msg': 'Successfully created user'
        }), 201

    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
@users_bp.route('/edit-user/<uid>', methods=['PUT'])
def edit_user(uid):
    try:
        db = current_app.config['db']
        data = request.get_json()

        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400
        
        user = get_current_user()
        if not user or not user['is_admin']:
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        updated_info = {}
        updated_fields = ["email", "password", "committee", "role", "name", "memo_tokens", "is_admin", "points"]
        for field in updated_fields:
            if field in data:
                updated_info[field] = data[field]
        
        update_args = {}
        if "email" in data:
            update_args["email"] = data["email"]
        if "password" in data:
            update_args["password"] = data["password"]
        if "name" in data:
            update_args["display_name"] = data["name"]

        if update_args:
            auth.update_user(uid, **update_args)

        # --- Update custom claims (role, admin, etc.) ---
        claims = {}
        if "is_admin" in data:
            claims["is_admin"] = data["is_admin"]
        if "role" in data:
            claims["role"] = data["role"]
        if claims:
            auth.set_custom_user_claims(uid, claims)
        
        rank = user_rank_checker(data.get('points', 0))

        updated_info['rank'] = rank
        users_ref = db.collection('Users').document(uid)
        users_ref.update((
            updated_info
        ))

        auth.revoke_refresh_tokens(uid)

        return jsonify({
            'msg': 'Successfully updated the user'
        }), 200

    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
# @users_bp.route('/edit-points/<uid>', methods=['PUT'])
# def edit_user(uid):
#     try:
#         db = current_app.config['db']
#         data = request.get_json()

#         if not data:
#             return jsonify({'msg': 'Missing JSON data'}), 400
        
#         user = get_current_user()
#         if not user or not user['is_admin']:
#             return jsonify({'msg': 'Unauthorized User'}), 401
        
#         points = data.get('points', 0)
#         if points < 0:
#             return jsonify({'msg': 'Points cannot be negative'}), 400
        
#         users_ref = db.collection('Users').document(uid)
#         users_ref.update({'points': points})

#         return jsonify({
#             'msg': 'Successfully updated the user'
#         }), 200

#     except Exception as e:
#         return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    

@users_bp.route('/delete-user/<uid>', methods=['DELETE'])
def delete_user(uid):
    try:
        db = current_app.config['db']
        
        # Check if the requester is admin
        user = get_current_user()
        if not user or not user.get("is_admin", False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        # Delete from Firestore
        users_ref = db.collection('Users').document(uid)
        users_ref.delete()

        # Delete from Firebase Auth
        auth.delete_user(uid)

        return jsonify({'msg': 'Successfully deleted the user'}), 200

    except auth.AuthError as e:
        # Handle Firebase Auth-specific errors
        return jsonify({'msg': 'Failed to delete user from Firebase Auth', 'error': str(e)}), 500
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
