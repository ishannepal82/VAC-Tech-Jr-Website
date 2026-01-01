from flask import Blueprint, jsonify, current_app
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


@dashboard_bp.route('/admin-dashboard', methods=['GET'])
def get_admin_dashboard_info():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401
        
        # Check if user is admin
        is_admin = user.get('is_admin', False)
        if not is_admin:
            return jsonify({'msg': 'Access denied. Admin privileges required.'}), 403
        
        db = current_app.config['db']
        
        # Fetch user info
        user_ref = db.collection('Users').document(user['uid'])
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'msg': 'User not found'}), 404

        user_data = user_doc.to_dict()
        user_name = user_data.get('name', 'Admin')

        # 1. Count unapproved projects (is_approved == False)
        unapproved_projects_count = 0
        projects_ref = db.collection('projects')
        
        # Check both 'is_approved' and 'approved' fields for compatibility
        unapproved_query = projects_ref.where('is_approved', '==', False)
        unapproved_projects_count = sum(1 for _ in unapproved_query.stream())

        # 2. Count upcoming events (status == 'upcoming')
        upcoming_events_count = 0
        events_ref = db.collection('events')
        upcoming_query = events_ref.where('status', '==', 'upcoming')
        upcoming_events_count = sum(1 for _ in upcoming_query.stream())

        # 3. Count total number of members
        total_members = 0
        members_ref = db.collection('Users')
        total_members = sum(1 for _ in members_ref.stream())

        # Optional: Count active polls if needed
        active_polls_count = 0
        try:
            polls_ref = db.collection('polls')
            active_polls_query = polls_ref.where('status', '==', 'Active')
            active_polls_count = sum(1 for _ in active_polls_query.stream())
        except Exception:
            active_polls_count = 0

        return jsonify({
            'msg': 'Successfully fetched admin dashboard info',
            'is_admin': True,
            'user_name': user_name,
            'stats': {
                'total_members': total_members,
                'active_events': upcoming_events_count,
                'pending_projects': unapproved_projects_count,
                'active_polls': active_polls_count
            }
        }), 200
    
    except Exception as e:
        print(f"Admin dashboard error: {str(e)}")
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500