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
        user_ref = db.collection('Users').document(user['uid'])
        user_doc = user_ref.get()
        
        is_admin = user['is_admin']
        role = user.get('role', 'member')
        

        if not user_doc.exists:
            return jsonify({'msg': 'User not found'}), 404
        user_data = user_doc.to_dict()

        user_info = {
            **user_data,
            'is_admin': is_admin,
            "role": role
        }

        return jsonify({
            'msg': 'Successfully fetched user dashbaord info',
            'user_info': user_info
        }), 200
    
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
@dashboard_bp.route('/add-workshop', methods=['POST'])
def add_workshops():
    try:
        data = request.json()
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

        return jsonify({
            'msg': 'Successfully fetched user dashbaord info'
        }), 200
    
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500