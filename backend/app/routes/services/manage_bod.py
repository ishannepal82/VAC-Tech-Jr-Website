from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import firestore
import cloudinary.uploader

bod_bp = Blueprint('bod', __name__)

@bod_bp.route('/bod', methods=["GET"])
def get_bod():
    try:
        db = current_app.config['db']
        user = get_current_user()

        bod_ref = db.collection('bod').where('comittee', '==', 'BOD')
        bod = [doc.to_dict() | {"id": doc.id} for doc in bod_ref.stream()]

        return jsonify({'msg': 'Successfully fetched BOD', 'bod': bod}), 200

    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


@bod_bp.route('/add-bod', methods=["POST"])
def add_bod():
    try:
        db = current_app.config['db']

        name = request.form.get('name')
        role = request.form.get('role')
        image_file = request.files.get('image')

        if not all([name, role]):
            return jsonify({'msg': 'Missing required fields'}), 400

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        # Upload image to Cloudinary
        image_url = ''
        if image_file:
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result.get('secure_url', '')

        new_doc = db.collection('bod').document()
        new_doc.set({
            'name': name,
            'role': role,
            'image': image_url,
            'comittee': "BOD",
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'msg': 'Board member added successfully'}), 201

    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ✅ 3. Edit existing BOD member (only name, role, image)
@bod_bp.route('/edit-bod/<uid>', methods=["PUT"])
def edit_bod(uid):
    try:
        db = current_app.config['db']

        name = request.form.get('name')
        role = request.form.get('role')
        comittee = request.form.get('comittee')
        image_file = request.files.get('image')

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        bod_ref = db.collection('bod').document(uid)
        doc = bod_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'BOD member not found'}), 404

        update_data = {}
        if name:
            update_data['name'] = name
        if role:
            update_data['role'] = role
        if comittee:
            update_data['comittee'] = comittee

        # Upload new image if provided
        if image_file:
            upload_result = cloudinary.uploader.upload(image_file)
            update_data['image'] = upload_result.get('secure_url', '')

        update_data['updated_at'] = firestore.SERVER_TIMESTAMP

        bod_ref.update(update_data)

        return jsonify({'msg': 'BOD member updated successfully'}), 200

    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ✅ 4. Delete BOD member (only Firestore)
@bod_bp.route('/delete-bod/<uid>', methods=["DELETE"])
def delete_bod(uid):
    try:
        db = current_app.config['db']
        user = get_current_user()

        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        bod_ref = db.collection('bod').document(uid)
        doc = bod_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'BOD member not found'}), 404

        # Delete Firestore doc ONLY
        bod_ref.delete()

        return jsonify({'msg': 'BOD member deleted successfully'}), 200

    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500
