from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import auth, firestore
from firebase_admin.exceptions import FirebaseError
import cloudinary.uploader

bod_bp = Blueprint('bod', __name__)

# ✅ 1. Get all BOD members
@bod_bp.route('/bod', methods=["GET"])
def get_bod():
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401

        bod_ref = db.collection('bod').where('comittee', '==', 'BOD')
        bod = [doc.to_dict() | {"id": doc.id} for doc in bod_ref.stream()]

        return jsonify({'msg': 'Successfully fetched BOD', 'bod': bod}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ✅ 2. Add new BOD member (with Cloudinary upload)
@bod_bp.route('/add-bod', methods=["POST"])
def add_bod():
    try:
        db = current_app.config['db']

        # Get form data
        name = request.form.get('name')
        role = request.form.get('role')
        email = request.form.get('contact')  # "contact" if that's your frontend field
        password = request.form.get('password')
        image_file = request.files.get('image')
        is_admin = request.form.get('is_admin', 'false').lower() == 'true'

        if not all([name, role, email, password]):
            return jsonify({'msg': 'Missing required fields'}), 400

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        # Upload image to Cloudinary if provided
        image_url = ''
        if image_file:
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result.get('secure_url', '')

        # Create Firebase Auth user
        new_user = auth.create_user(
            email=email,
            password=password,
            display_name=name,
            disabled=False
        )

        # Store in Firestore
        bod_ref = db.collection('bod').document(new_user.uid)
        bod_ref.set({
            'uid': new_user.uid,
            'name': name,
            'role': role,
            'email': email,
            'image': image_url,
            'is_admin': is_admin,
            'comittee': "BOD",
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'msg': 'Board member added successfully'}), 201

    except FirebaseError as e:
        if 'EMAIL_EXISTS' in str(e):
            return jsonify({'msg': 'Email already exists'}), 400
        return jsonify({'msg': 'Firebase error', 'error': str(e)}), 500
    except Exception as e:
        if 'EMAIL_EXISTS' in str(e):
            return jsonify({'msg': 'Email already exists'}), 409
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ✅ 3. Edit existing BOD member (with Cloudinary update)
@bod_bp.route('/edit-bod/<uid>', methods=["PUT"])
def edit_bod(uid):
    try:
        db = current_app.config['db']

        name = request.form.get('name')
        role = request.form.get('role')
        email = request.form.get('email')
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
        if email:
            update_data['email'] = email
        if 'is_admin' in request.form:
            update_data['is_admin'] = request.form.get('is_admin', 'false').lower() == 'true'
        

        # Upload new image if provided
        if image_file:
            upload_result = cloudinary.uploader.upload(image_file)
            update_data['image'] = upload_result.get('secure_url', '')

        # Update Firebase Auth profile
        update_auth_args = {}
        if email:
            update_auth_args['email'] = email
        if name:
            update_auth_args['display_name'] = name
        if update_auth_args:
            auth.update_user(uid, **update_auth_args)

        update_data['updated_at'] = firestore.SERVER_TIMESTAMP
        bod_ref.update(update_data)

        return jsonify({'msg': 'BOD member updated successfully'}), 200

    except FirebaseError as e:
        return jsonify({'msg': 'Firebase error', 'error': str(e)}), 500
    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


# ✅ 4. Delete BOD member (remove from Auth + Firestore)
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

        # Delete Firestore doc
        bod_ref.delete()

        # Delete Firebase Auth user
        auth.delete_user(uid)

        return jsonify({'msg': 'BOD member deleted successfully'}), 200

    except FirebaseError as e:
        return jsonify({'msg': 'Firebase error', 'error': str(e)}), 500
    except Exception as e:
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500
