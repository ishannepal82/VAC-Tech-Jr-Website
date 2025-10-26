from flask import Blueprint, jsonify, request, current_app

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/get-leaderboard', methods=['GET'])
def get_leaderboard_info():
    try:
        db = current_app.config['db']
        users_ref = db.collection('Users')
        users = [doc.to_dict() | {"id": doc.id} for doc in users_ref.stream()]

        '''Using Python anonyomous Function for Fetching Points accordingly'''
        sorted_users = sorted(users, key=lambda u: u.get('points', 0), reverse=True)
        return jsonify ({
            'msg': 'Sucessfully got user info', 
            'sorted_users': sorted_users
            }), 200

    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    