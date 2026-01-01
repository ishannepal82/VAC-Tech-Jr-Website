from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from firebase_admin import firestore
import uuid
from werkzeug.utils import secure_filename
import os

community_bp = Blueprint('community', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def upload_image_to_storage(file, folder='community_events'):
    """Upload image to Cloudinary and return the public URL"""
    try:
        import cloudinary.uploader

        if not file:
            return None

        # Generate a secure and unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{folder}/{uuid.uuid4()}_{filename}"

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            public_id=unique_filename,
            folder=folder,
            resource_type="image",
            overwrite=True
        )

        # Return the Cloudinary secure URL
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {str(e)}")
        return None


@community_bp.route('/events', methods=["GET"])
def get_community_events():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401
        
        db = current_app.config['db']
        community_ref = db.collection('community_events').order_by('created_at', direction=firestore.Query.DESCENDING)
        events = []
        
        for doc in community_ref.stream():
            event_data = doc.to_dict()
            event_data['id'] = doc.id
            events.append(event_data)

        return jsonify({'msg': 'Successfully fetched community events', 'events': events}), 200
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


@community_bp.route('/add-community', methods=["POST"])
def create_community_event():
    
    try:
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        # Get form data
        title = request.form.get('title')
        description = request.form.get('description')
        is_published = request.form.get('is_published', 'true').lower() == 'true'
        
        # Validate required fields
        if not title or not description:
            return jsonify({'msg': 'Title and description are required'}), 400

        # Handle image upload
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                image_url = upload_image_to_storage(file, 'community_events')

        # Create event in Firestore
        db = current_app.config['db']
        community_ref = db.collection('community_events').document()
        
        event_data = {
            'id': community_ref.id,
            'title': title,
            'description': description,
            'is_published': is_published,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        if image_url:
            event_data['image_url'] = image_url
            
        community_ref.set(event_data)

        return jsonify({'msg': 'Community event created successfully', 'event_id': community_ref.id}), 201
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500



@community_bp.route('/update/<event_id>', methods=["PUT"])
def update_community_event(event_id):
    try:
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        db = current_app.config['db']
        community_ref = db.collection('community_events').document(event_id)
        doc = community_ref.get()
        
        if not doc.exists:
            return jsonify({'msg': 'Community event not found'}), 404

        # Get form data
        title = request.form.get('title')
        description = request.form.get('description')
        is_published = request.form.get('is_published', 'true').lower() == 'true'

        update_data = {
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        if title:
            update_data['title'] = title
        if description:
            update_data['description'] = description
        
        update_data['is_published'] = is_published

        # Handle image upload
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                image_url = upload_image_to_storage(file, 'community_events')
                if image_url:
                    update_data['image_url'] = image_url

        community_ref.update(update_data)

        return jsonify({'msg': 'Community event updated successfully'}), 200
    except Exception as e:
        print(f"Error updating event: {str(e)}")
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500



@community_bp.route('/delete/<event_id>', methods=["DELETE"])
def delete_community_event(event_id):
    
    try:
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        db = current_app.config['db']
        community_ref = db.collection('community_events').document(event_id)
        doc = community_ref.get()
        
        if not doc.exists:
            return jsonify({'msg': 'Community event not found'}), 404

        # Optionally delete the image (Cloudinary deletion optional, keeping structure same)
        event_data = doc.to_dict()
        if 'image_url' in event_data and event_data['image_url']:
            try:
                pass  # You can add Cloudinary deletion logic if needed
            except Exception as img_err:
                print(f"Error deleting image: {str(img_err)}")
                # Continue with event deletion even if image deletion fails

        community_ref.delete()

        return jsonify({'msg': 'Community event deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


@community_bp.route('/event/<event_id>', methods=["GET"])
def get_community_event(event_id):
    try:
        db = current_app.config['db']
        community_ref = db.collection('community_events').document(event_id)
        doc = community_ref.get()
        
        if not doc.exists:
            return jsonify({'msg': 'Community event not found'}), 404

        event_data = doc.to_dict()
        event_data['id'] = doc.id

        return jsonify({'msg': 'Successfully fetched community event', 'event': event_data}), 200
    except Exception as e:
        print(f"Error fetching event: {str(e)}")
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500
