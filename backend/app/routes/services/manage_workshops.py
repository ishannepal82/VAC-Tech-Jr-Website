from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import firestore

workshops_bp = Blueprint('workshops', __name__)

# ===========================
# GET ALL WORKSHOPS
# ===========================
@workshops_bp.route('/workshops', methods=["GET"])
def get_workshops():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'Msg': 'Unauthorized'}), 401

        db = current_app.config['db']
        workshops_ref = db.collection('workshops')
        workshops = [doc.to_dict() for doc in workshops_ref.stream()]

        return jsonify({'msg': 'Successfully fetched workshops', 'workshops': workshops}), 200
    except Exception as e:
        return jsonify({'Msg': 'Internal Server Error', 'error': str(e)}), 500


# ===========================
# ADD WORKSHOP
# ===========================
@workshops_bp.route('/add-workshop', methods=["POST"])
def add_workshop():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        required_fields = ["title", "description", "date", "location"]
        for field in required_fields:
            if field not in data:
                return jsonify({'msg': f'Missing field: {field}'}), 400

        db = current_app.config['db']
        workshop_ref = db.collection('workshops').document()
        workshop_ref.set({
            'id': workshop_ref.id,
            'title': data["title"],
            'description': data["description"],
            'date': data["date"],
            'location': data["location"],
            'image': data.get("image", ""),
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'msg': 'Workshop added successfully'}), 201
    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ===========================
# EDIT WORKSHOP
# ===========================
@workshops_bp.route('/edit-workshop/<id>', methods=["PUT"])
def edit_workshop(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        db = current_app.config['db']
        workshop_ref = db.collection('workshops').document(id)
        doc = workshop_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Workshop not found'}), 404

        update_data = {}
        allowed_fields = ['title', 'description', 'date', 'location', 'image']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        update_data['updated_at'] = firestore.SERVER_TIMESTAMP
        workshop_ref.update(update_data)

        return jsonify({'msg': 'Workshop updated successfully'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ===========================
# DELETE WORKSHOP
# ===========================
@workshops_bp.route('/delete-workshop/<id>', methods=["DELETE"])
def delete_workshop(id):
    try:
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        db = current_app.config['db']
        workshop_ref = db.collection('workshops').document(id)
        doc = workshop_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Workshop not found'}), 404

        workshop_ref.delete()

        return jsonify({'msg': 'Workshop deleted successfully'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500
