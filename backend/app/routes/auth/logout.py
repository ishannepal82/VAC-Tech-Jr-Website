from flask import request, jsonify, make_response, current_app
from firebase_admin import auth
from app.routes.auth.bp import auth_bp


@auth_bp.route('/logout', methods=['POST'])
def logout_user():
    try:
        session_cookie = request.cookies.get('session')
        if session_cookie:
            try:
                decoded = auth.verify_session_cookie(session_cookie, check_revoked=False)
                auth.revoke_refresh_tokens(decoded['uid'])
            except auth.InvalidSessionCookieError:
                current_app.logger.warning("Invalid session cookie received during logout.")
            except Exception:
                current_app.logger.exception("Failed to process session revocation during logout.")

        response = make_response(jsonify({'message': 'Logout successful'}))
        response.delete_cookie(
            'session',
            path='/',
            secure=False,
            httponly=True,
            samesite='None'
        )
        return response, 200
    except Exception as exc:
        current_app.logger.exception("Error occurred during logout.")
        return jsonify({'msg': 'Internal server error', 'error': str(exc)}), 500

