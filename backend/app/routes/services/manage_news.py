from flask import Blueprint, jsonify, request, current_app
from firebase_admin import firestore
from app.routes.utils.user_verifier_func import get_current_user

news_bp = Blueprint('news', __name__)

@news_bp.route('/news', methods=['GET'])
def get_all_news():
    """Public endpoint - Get all community news ordered by date"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401
        
        db = current_app.config['db']
        news_ref = db.collection('community_news').order_by('created_at', direction=firestore.Query.DESCENDING)
        
        news_list = []
        for doc in news_ref.stream():
            data = doc.to_dict()
            news_item = {
                "id": doc.id,
                "title": data.get("title", "Untitled"),
                "description": data.get("description", ""),
                "image_url": data.get("image_url"),
                "created_at": data.get("created_at")
            }
            # Only return published news to public
            if data.get("is_published", True):
                news_list.append(news_item)
        
        return jsonify({
            'msg': 'Successfully fetched community news',
            'news': news_list
        }), 200
        
    except Exception as e:
        print(f"Error in get_all_news: {str(e)}")
        return jsonify({
            'msg': 'Internal server error',
            'error': str(e)
        }), 500


@news_bp.route('/create-news', methods=['POST'])
def create_news():
    """Admin only - Create new community news using FormData"""
    try:
        db = current_app.config['db']
        user = get_current_user()
        
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        # Extract fields from FormData (request.form)
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        is_published_raw = request.form.get('is_published', 'true')
        is_published = is_published_raw.lower() in ('true', '1', 'yes')

        if not title:
            return jsonify({'msg': 'Title cannot be empty'}), 400
        
        # Create news document
        news_ref = db.collection('community_news').document()
        news_ref.set({
            "title": title,
            "description": description,
            "is_published": is_published,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'msg': 'Successfully created news item',
            'id': news_ref.id
        }), 201
        
    except Exception as e:
        print(f"Create news error: {str(e)}")
        return jsonify({
            'msg': 'Internal server error',
            'error': str(e)
        }), 500


@news_bp.route('/update/<news_id>', methods=['PUT'])
def update_news(news_id):
    """Admin only - Update existing community news using FormData"""
    try:
        db = current_app.config['db']
        user = get_current_user()
        
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        # Check if document exists
        news_doc_ref = db.collection('community_news').document(news_id)
        doc = news_doc_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'News item not found'}), 404

        # Get form data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        is_published_raw = request.form.get('is_published', 'true')
        is_published = is_published_raw.lower() in ('true', '1', 'yes')

        if not title:
            return jsonify({'msg': 'Title cannot be empty'}), 400

        # Update document
        news_doc_ref.update({
            "title": title,
            "description": description,
            "is_published": is_published
        })

        return jsonify({'msg': 'News updated successfully'}), 200

    except Exception as e:
        print(f"Update news error: {str(e)}")
        return jsonify({
            'msg': 'Internal server error',
            'error': str(e)
        }), 500


@news_bp.route('/delete/<news_id>', methods=['DELETE'])
def delete_news(news_id):
    """Admin only - Delete a news item"""
    try:
        db = current_app.config['db']
        user = get_current_user()
        
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized'}), 401

        news_doc_ref = db.collection('community_news').document(news_id)
        if not news_doc_ref.get().exists:
            return jsonify({'msg': 'News item not found'}), 404

        news_doc_ref.delete()
        return jsonify({'msg': 'News deleted successfully'}), 200

    except Exception as e:
        print(f"Delete news error: {str(e)}")
        return jsonify({
            'msg': 'Internal server error',
            'error': str(e)
        }), 500