from flask import Blueprint, request, current_app, jsonify
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import firestore

notifications_bp = Blueprint('notifications_bp', __name__)

@notifications_bp.route('/get-notifications', methods=['GET'])
def get_notifications():
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user:
            return jsonify({'Msg': 'Unauthorized'}), 401
        
        notifications_ref = db.collection('notifications')
        query = notifications_ref.where('to_email', '==', user['email']).order_by('created_at', direction=firestore.Query.DESCENDING)
        notifications = [doc.to_dict() for doc in query.limit(20).stream()]

        return jsonify({'notifications': notifications}), 200
    except Exception as e:
        return jsonify({
            'Msg': 'Internal Server Error',
            'error': str(e)
        }), 500