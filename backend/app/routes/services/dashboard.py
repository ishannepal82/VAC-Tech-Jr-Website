from flask import Blueprint, jsonify, current_app, request
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import firestore

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard_info():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401
        
        db = current_app.config['db']
        
        # Fetch user info
        user_ref = db.collection('Users').document(user['uid'])
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'msg': 'User not found'}), 404

        user_data = user_doc.to_dict()
        role = user_data.get('role', None)
        is_admin = user.get('is_admin', False)

        user_info = {
            **user_data,
            'is_admin': is_admin,
            'role': role
        }

        contributions_ref = db.collection('contributions').where('uid', '==', user['uid'])
        contributions = [
            {'id': doc.id, **doc.to_dict()}
            for doc in contributions_ref.stream()
        ]

        return jsonify({
            'msg': 'Successfully fetched user dashboard info',
            'user_info': user_info,
            'contributions': contributions
        }), 200
    
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500



@dashboard_bp.route('/add-workshop', methods=['POST'])
def add_workshops():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Bad request'}), 400
        
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401
        
        workshops = data.get('workshops', [])

        db = current_app.config['db']
        user_ref = db.collection('Users').document(user['uid'])
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'msg': 'User not found'}), 404
        
        user_ref.update({
            'workshops': firestore.ArrayUnion(workshops)
        })

        return jsonify({'msg': 'Workshops added successfully'}), 200
    
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
