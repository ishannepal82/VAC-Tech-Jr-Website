from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from app.routes.utils.user_rank_checker import user_rank_checker
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

users_bp = Blueprint('users', __name__)

@users_bp.route('/get-all-users', methods=['GET'])
def get_all_users():
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get('is_admin', False):
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
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401

        firebase_user = auth.create_user(
            email=data.get('email'),
            password=data.get('password'),
            display_name=data.get('name')
        )

        uid = firebase_user.uid
        auth.set_custom_user_claims(uid, {'is_admin': data.get('is_admin', False)})

        users_ref = db.collection('Users').document(uid)
        users_ref.set({
            'name': data.get('name'),
            'memo_tokens': data.get('memo_tokens', 0),
            'points': 0,
            'role': data.get('role'),
            'committee': data.get('committee'),
            'is_admin': data.get('is_admin', False),
            'rank': 'Newbie',
            'email': data.get('email'),
            'workshops': []
        })

        return jsonify({'msg': 'Successfully created user'}), 201

    except FirebaseError as e:
        if 'EMAIL_EXISTS' in str(e):
            return jsonify({'msg': 'Email already exists'}), 400
        return jsonify({'msg': 'Firebase error', 'error': str(e)}), 500
    except Exception as e:
        if 'EMAIL_EXISTS' in str(e):
            return jsonify({'msg': 'Email already exists'}), 409
        
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@users_bp.route('/edit-user/<uid>', methods=['PUT'])
def edit_user(uid):
    try:
        db = current_app.config['db']
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400

        current_user = get_current_user()
        if not current_user or not current_user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401

        users_ref = db.collection('Users').document(uid)
        current_doc = users_ref.get()
        if not current_doc.exists:
            return jsonify({'msg': 'User does not exist'}), 404

        updated_info = {}
        updated_fields = ["email", "password", "committee", "role", "name", "memo_tokens", "is_admin", "points"]
        for field in updated_fields:
            if field in data:
                updated_info[field] = data[field]

        # Update Firebase Auth
        update_args = {}
        if "email" in data:
            update_args["email"] = data["email"]
        if "password" in data:
            update_args["password"] = data["password"]
        if "name" in data:
            update_args["display_name"] = data["name"]

        if update_args:
            auth.update_user(uid, **update_args)

        # Update custom claims
        claims = {}
        if "is_admin" in data:
            claims["is_admin"] = data["is_admin"]
        if "role" in data:
            claims["role"] = data["role"]
        if claims:
            auth.set_custom_user_claims(uid, claims)

        # Compute rank based on points
        current_points = updated_info.get('points', current_doc.to_dict().get('points', 0))
        updated_info['rank'] = user_rank_checker(current_points)

        users_ref.update(updated_info)
        auth.revoke_refresh_tokens(uid)

        return jsonify({'msg': 'Successfully updated the user'}), 200

    except FirebaseError as e:
        return jsonify({'msg': 'Firebase error', 'error': str(e)}), 500
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500



@users_bp.route('/delete-user/<uid>', methods=['DELETE'])
def delete_user(uid):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get("is_admin", False):
            return jsonify({'msg': 'Unauthorized User'}), 401

        # Delete from Firebase Auth first
        auth.delete_user(uid)

        # Delete from Firestore
        users_ref = db.collection('Users').document(uid)
        users_ref.delete()

        return jsonify({'msg': 'Successfully deleted the user'}), 200

    except FirebaseError as e:
        return jsonify({'msg': 'Firebase error', 'error': str(e)}), 500
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
