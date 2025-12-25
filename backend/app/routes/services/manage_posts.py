from flask import Blueprint, jsonify, request, current_app
from firebase_admin import firestore
from app.routes.utils.user_verifier_func import get_current_user

posts_bp = Blueprint("posts", __name__)


def get_db():
    """
    Helper function to retrieve the Firestore client
    from the Flask application configuration.
    """
    return current_app.config["db"]


@posts_bp.route("/posts", methods=["GET"])
def get_all_posts():
    """
    Retrieve all posts.

    Authentication:
        - Requires a valid authenticated user.

    Returns:
        - 200: List of posts
        - 401: Unauthorized
        - 500: Internal server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        db = get_db()
        posts_ref = db.collection("posts")
        posts = []

        for doc in posts_ref.stream():
            post = doc.to_dict()
            post["id"] = doc.id
            posts.append(post)

        return jsonify({"posts": posts}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    
@posts_bp.route("/comments/<post_id>", methods=["GET"])
def get_post_comments(post_id):
    """
    Retrieve comments for a specific post.

    Authentication:
        - Requires a valid authenticated user.
    Returns:
        - 200: List of comments
        - 401: Unauthorized
        - 404: Post not found
        - 500: Internal server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        db = get_db()
        post_ref = db.collection("posts").document(post_id)
        post_doc = post_ref.get()

        if not post_doc.exists:
            return jsonify({"error": "Post not found"}), 404

        post_data = post_doc.to_dict()
        comments = post_data.get("comments", [])

        return jsonify({"comments": comments}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    

@posts_bp.route("/create-post", methods=["POST"])
def create_post():
    """
    Create a new post.

    Authentication:
        - Requires an authenticated admin user.

    Payload:
        {
            "title": "string",
            "content": "string"
        }

    Returns:
        - 201: Post created
        - 400: Invalid payload
        - 401: Unauthorized
        - 500: Internal server error
    """
    try:
        user = get_current_user()
        if not user or not user.get("is_admin", False):
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400

        title = data.get("title")
        content = data.get("content")
        author = user.get("name", "Unknown")

        if not title or not content:
            return jsonify({"error": "Title and content are required"}), 400

        db = get_db()
        post_ref = db.collection("posts").document()

        post_ref.set({
            "title": title,
            "content": content,
            "comments": [],
            "likes": 0,
            "liked_by": [],
            "author": author,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return jsonify({"msg": "Post created successfully", "id": post_ref.id}), 201

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@posts_bp.route("/posts/<post_id>/like", methods=["POST"])
def like_post(post_id):
    """
    Increment the like count of a post.

    Authentication:
        - Requires an authenticated user.

    Returns:
        - 200: Like registered
        - 401: Unauthorized
        - 404: Post not found
        - 500: Internal server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        db = get_db()
        post_ref = db.collection("posts").document(post_id)

        if not post_ref.get().exists:
            return jsonify({"error": "Post not found"}), 404
        
        if user.get("email") in post_ref.get().to_dict().get("liked_by", []):
            return jsonify({"error": "You have already liked this post"}), 400

        post_ref.update({
            "likes": firestore.Increment(1),
            "liked_by": firestore.ArrayUnion([user.get("email")])
        })

        return jsonify({"msg": "Post liked successfully"}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@posts_bp.route("/posts/<post_id>/comment", methods=["POST"])
def comment_on_post(post_id):
    """
    Add a comment to a post.

    Authentication:
        - Requires an authenticated user.

    Payload:
        {
            "comment": "string"
        }

    Returns:
        - 200: Comment added
        - 400: Invalid payload
        - 401: Unauthorized
        - 404: Post not found
        - 500: Internal server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        if not data or not data.get("comment"):
            return jsonify({"error": "Comment text is required"}), 400

        db = get_db()
        post_ref = db.collection("posts").document(post_id)

        if not post_ref.get().exists:
            return jsonify({"error": "Post not found"}), 404

        comment = {
            "user": user.get("name", "Anonymous"),
            "text": data["comment"],
        }

        post_ref.update({
            "comments": firestore.ArrayUnion([comment])
        })

        return jsonify({"msg": "Comment added successfully"}), 201

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
