from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
from google.cloud import firestore
from datetime import datetime
import cloudinary
import cloudinary.uploader
import os

gallery_bp = Blueprint("gallery", __name__)

@gallery_bp.route("/create-memory", methods=["POST"])
def create_memory():
    try:
        # Auth
        user = get_current_user()
        if not user:
            return jsonify({"msg": "Unauthorized user"}), 401

        uid = user.get("uid")
        db = current_app.config["db"]

        # Validate user doc
        user_ref = db.collection("Users").document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"msg": "User not found"}), 404

        user_data = user_doc.to_dict()
        memo_tokens = user_data.get("memo_tokens", 0)
        if memo_tokens <= 0:
            return jsonify({"msg": "Insufficient memo tokens to upload memories"}), 403

        # Get form data
        title = (request.form.get("title") or "Untitled Memory").strip()
        author = user.get("name", "anonymous")
        
        # Get uploaded files
        if "photos" not in request.files and "photos[]" not in request.files:
            if "photo" not in request.files:
                return jsonify({"msg": "No photos provided"}), 400
            photos = [request.files["photo"]]
        else:
            photos = request.files.getlist("photos") or request.files.getlist("photos[]")
        
        # Filter out empty files
        photos = [photo for photo in photos if photo and photo.filename]
        
        if not photos:
            return jsonify({"msg": "No valid photos provided"}), 400
        
        # Validate file types
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
        for photo in photos:
            ext = photo.filename.rsplit('.', 1)[1].lower() if '.' in photo.filename else ''
            if ext not in allowed_extensions:
                return jsonify({"msg": f"Invalid file type: {photo.filename}. Allowed types: {', '.join(allowed_extensions)}"}), 400

        uploaded_files = []
        failed = []

        # Upload each photo to Cloudinary
        for photo in photos:
            try:
                original_filename = photo.filename
                base_name = os.path.splitext(original_filename)[0]
                timestamp = int(datetime.utcnow().timestamp())
                public_id = f"memories/{uid}/{base_name}_{timestamp}"
                
                result = cloudinary.uploader.upload(
                    photo,
                    public_id=public_id,
                    folder="gallery_memories",
                    resource_type="image",
                    tags=[f"memory", f"user_{uid}"],
                    context={
                        "caption": title,
                        "author": author,
                        "original_name": original_filename
                    },
                    eager=[
                        {
                            "width": 1920,
                            "height": 1080,
                            "crop": "limit",
                            "quality": "auto:best",
                            "fetch_format": "webp"
                        }
                    ],
                    eager_async=False,
                    overwrite=True,
                    invalidate=True,
                    transformation={
                        "quality": "auto:eco",
                        "fetch_format": "auto"
                    }
                )

                optimized_url = result.get("eager", [{}])[0].get("secure_url", result.get("secure_url"))
                
                if result.get("secure_url"):
                    uploaded_files.append({
                        "cloudinary_url": optimized_url or result["secure_url"],
                        "original_url": result["secure_url"],
                        "public_id": result["public_id"],
                        "version": result.get("version"),
                        "format": result.get("format"),
                        "width": result.get("width"),
                        "height": result.get("height"),
                        "bytes": result.get("bytes"),
                        "original_name": original_filename,
                        "resource_type": result.get("resource_type"),
                    })
                else:
                    failed.append({"source": original_filename, "reason": "No URL returned by Cloudinary"})
                    
            except Exception as e:
                failed.append({"source": photo.filename, "reason": str(e)})

        if not uploaded_files:
            return jsonify({"msg": "Upload failed for all photos", "failed": failed}), 400

        total_original_size = sum(f.get("bytes", 0) for f in uploaded_files)
        size_in_mb = round(total_original_size / (1024 * 1024), 2) if total_original_size > 0 else 0

        # Store memory doc
        gallery_ref = db.collection("Gallery")
        doc_ref = gallery_ref.add({
            "title": title,
            "author": author,
            "author_id": uid,
            "photos": [fi["cloudinary_url"] for fi in uploaded_files],
            "files_data": uploaded_files,
            "created_at": firestore.SERVER_TIMESTAMP,
            "total_size_mb": size_in_mb,
        })
        memory_id = doc_ref[1].id

        # Deduct 1 token (atomic)
        user_ref.update({"memo_tokens": firestore.Increment(-1)})

        # Get updated memo tokens
        updated_user_doc = user_ref.get()
        updated_memo_tokens = updated_user_doc.to_dict().get("memo_tokens", 0) if updated_user_doc.exists else 0

        return jsonify({
            "msg": "Successfully uploaded memories",
            "memory": {
                "id": memory_id,
                "title": title,
                "author": author,
                "photos": [fi["cloudinary_url"] for fi in uploaded_files],
                "created_at": datetime.utcnow().isoformat(),
            },
            "uploaded_count": len(uploaded_files),
            "total_size_mb": size_in_mb,
            "memo_tokens": updated_memo_tokens,  # Return updated tokens
            "failed": failed,
        }), 201

    except Exception as e:
        current_app.logger.exception("Error in create_memory")
        return jsonify({"msg": "Internal server error", "error": str(e)}), 500


@gallery_bp.route("/memories", methods=["GET"])
def get_all_memories():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"msg": "Unauthorized user"}), 401

        uid = user.get("uid")
        db = current_app.config["db"]

        # Fetch user's memo tokens
        user_ref = db.collection("Users").document(uid)
        user_doc = user_ref.get()
        
        memo_tokens = 0
        if user_doc.exists:
            user_data = user_doc.to_dict()
            memo_tokens = user_data.get("memo_tokens", 0)

        # Fetch memories
        try:
            gallery_ref = db.collection("Gallery").order_by("created_at", direction=firestore.Query.DESCENDING).limit(50)
        except Exception:
            gallery_ref = db.collection("Gallery").limit(50)

        memories = []
        for doc in gallery_ref.stream():
            d = doc.to_dict()
            d["id"] = doc.id
            if d.get("created_at"):
                try:
                    d["created_at"] = d["created_at"].strftime("%a, %d %b %Y %H:%M:%S GMT")
                except Exception:
                    d["created_at"] = datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT")
            memories.append(d)

        return jsonify({
            "msg": "Successfully fetched memories",
            "memories": memories,
            "memo_tokens": memo_tokens,  # Include memo tokens in response
            "uid": uid
        }), 200

    except Exception as e:
        current_app.logger.exception("Error in get_all_memories")
        return jsonify({"msg": "Internal server error", "error": str(e)}), 500


@gallery_bp.route("/memories/<memory_id>", methods=["DELETE"])
def delete_memory(memory_id):
    """Delete a memory and its associated Cloudinary images"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({"msg": "Unauthorized user"}), 401

        uid = user.get("uid")
        db = current_app.config["db"]

        # Get the memory document
        memory_ref = db.collection("Gallery").document(memory_id)
        memory_doc = memory_ref.get()

        if not memory_doc.exists:
            return jsonify({"msg": "Memory not found"}), 404

        memory_data = memory_doc.to_dict()

        # Check if user owns this memory
        if memory_data.get("author_id") != uid:
            return jsonify({"msg": "Unauthorized to delete this memory"}), 403

        # Delete images from Cloudinary
        files_data = memory_data.get("files_data", [])
        deleted_count = 0
        failed_deletions = []

        for file_info in files_data:
            public_id = file_info.get("public_id")
            if public_id:
                try:
                    result = cloudinary.uploader.destroy(public_id, resource_type="image")
                    if result.get("result") == "ok":
                        deleted_count += 1
                    else:
                        failed_deletions.append(public_id)
                except Exception as e:
                    current_app.logger.error(f"Failed to delete Cloudinary image {public_id}: {str(e)}")
                    failed_deletions.append(public_id)

        # Delete the Firestore document
        memory_ref.delete()

        return jsonify({
            "msg": "Memory deleted successfully",
            "deleted_images": deleted_count,
            "failed_deletions": failed_deletions if failed_deletions else None
        }), 200

    except Exception as e:
        current_app.logger.exception("Error in delete_memory")
        return jsonify({"msg": "Internal server error", "error": str(e)}), 500