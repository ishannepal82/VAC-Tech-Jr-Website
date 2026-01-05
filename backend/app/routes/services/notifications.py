from typing import Optional

from flask import Blueprint, request, current_app, jsonify
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import firestore

notifications_bp = Blueprint('notifications_bp', __name__)


def _parse_bool_param(value: str) -> Optional[bool]:
    truthy = {'true', '1', 'yes'}
    falsy = {'false', '0', 'no'}
    lower = value.lower()
    if lower in truthy:
        return True
    if lower in falsy:
        return False
    return None

def check_user_is_admin():
    user = get_current_user()
    if user and user.get('is_admin', False):
        return True


@notifications_bp.route('/get-notifications', methods=['GET'])
def get_notifications():
    try:
        db = current_app.config.get('db')
        if db is None:
            current_app.logger.error("Firestore client is not configured on the app.")
            return jsonify({'msg': 'Internal Server Error'}), 500

        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401

        admin = bool(user.get('is_admin'))

        notifications_ref = db.collection('notifications')

        if admin:
            query = notifications_ref.where(
                'to_email', 'in', [user['email'], 'admin']
            )
        else:
            query = notifications_ref.where(
                'to_email', '==', user['email']
            )

        query = query.order_by(
            'created_at', direction=firestore.Query.DESCENDING
        )


        read_status_param = request.args.get('read_status')
        if read_status_param is not None:
            read_status = _parse_bool_param(read_status_param)
            if read_status is None:
                return jsonify({'msg': 'Invalid read_status parameter'}), 400
            query = query.where('read_status', '==', read_status)

        limit_param = request.args.get('limit', '20')
        try:
            limit = max(1, min(int(limit_param), 50))
        except ValueError:
            return jsonify({'msg': 'Invalid limit parameter'}), 400

        start_after_id = request.args.get('start_after')
        if start_after_id:
            last_doc = notifications_ref.document(start_after_id).get()
            if last_doc.exists:
                query = query.start_after(last_doc)
            else:
                return jsonify({'msg': 'Invalid start_after token'}), 400

        docs = list(query.limit(limit).stream())
        notifications = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data['id'] = doc.id
            notifications.append(doc_data)

        next_page_token = docs[-1].id if docs else None

        return jsonify({
            'notifications': notifications,
            'next_page_token': next_page_token
        }), 200
    except Exception as e:
        current_app.logger.exception("Failed to fetch notifications.")
        return jsonify({
            'msg': 'Internal Server Error',
            'error': str(e)
        }), 500