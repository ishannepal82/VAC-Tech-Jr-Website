from flask import Blueprint, jsonify, request, current_app
from imagekitio import ImageKit
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from app.routes.utils.user_verifier_func import get_current_user

gallery_bp = Blueprint("gallery", __name__)

# Initialize ImageKit instance (you can also load these from environment variables)
imagekit = ImageKit(
    public_key='your_public_key',
    private_key='your_private_key',
    url_endpoint='https://ik.imagekit.io/your_imagekit_id/'
)

@gallery_bp.route("/create-memory", methods=["POST"])
def create_memory():
    try:
        # 🔐 Authenticate user
        user = get_current_user()
        if not user:
            return jsonify({"msg": "Unauthorized user"}), 401

        uid = user.get('uid')
        db = current_app.config['db']
        user_ref = db.collection('Users').document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'msg': 'User not found'}), 404
        
        user_data = user_doc.to_dict()
        memo_tokens = user_data.get('memo_tokens', 0)

        if memo_tokens == 0:
            return jsonify({'msg': 'Insufficient memo tokens to upload memories'}), 403
        
        files = request.files.getlist('file')
        if not files or not len(files):
            return jsonify({'msg': 'No file uploaded'}), 400

        uploaded_files = []
        allowed_types = {'image/png', 'image/jpeg', 'image/jpg', 'video/mp4'}

        # 🖼️ Upload each file to ImageKit
        for file_to_upload in files:
            if file_to_upload.content_type not in allowed_types:
                continue  

            # Upload to ImageKit
            upload = imagekit.upload(
                file=file_to_upload,
                file_name=file_to_upload.filename,
                options=UploadFileRequestOptions(
                    tags=["memory", uid],
                    folder="/memories/",
                    is_private_file=False,
                    use_unique_file_name=True
                )
            )

            # Store upload info in Firestore
            gallery_ref = db.collection('Users').document(uid).collection('Gallery')
            gallery_ref.add({
                'imagekit_url': upload.url,
                'file_id': upload.file_id,
                'file_name': upload.name,
                'uploaded_at': upload.created_at
            })

            uploaded_files.append({
                'imagekit_url': upload.url,
                'file_id': upload.file_id
            })

        if len(uploaded_files) == 0:
            return jsonify({'msg': 'No valid files uploaded'}), 400
        
        # Deduct memo token
        user_ref.update({
            'memo_tokens': memo_tokens - 1
        })

        # Call the DB to Increment UserPoints

        return jsonify({
            'msg': 'Successfully uploaded memories',
            'files': uploaded_files
        }), 201

    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500


@gallery_bp.route("/memories", methods=["GET"])
def get_all_memory():
    try:
        # 🔐 Authenticate user
        user = get_current_user()
        if not user:
            return jsonify({"msg": "Unauthorized user"}), 401
        
        uid = user.get('uid')
        db = current_app.config['db']

        gallery_ref = db.collection('Users').document(uid).collection('Gallery')
        memories = [{**doc.to_dict(), "id": doc.id} for doc in gallery_ref.stream()]

        return jsonify({
            'msg': 'Successfully fetched memories',
            'memories': memories
        }), 200

    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
