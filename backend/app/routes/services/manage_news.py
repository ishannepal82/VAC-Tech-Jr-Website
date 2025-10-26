from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user

news_bp = Blueprint('news', __name__)

@news_bp.route('/add-news', methods=["POST"])
def add_news():
    try:
        db = current_app.config['db']
        data = request.json

        user = get_current_user()
        if not user.get('is_admin', False) or not user:
            return jsonify ({'msg': 'Unauthorized User'})

        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["title", "description"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        doc_ref = db.collection('news').document() 
        doc_ref.set({
            "title": data["title"],
            "description": data["description"]
        })

        return jsonify({'msg':'Sucessfully created the News'}), 201
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})
    
@news_bp.route('/get-all-news', methods=["GET"])
def get_all_news():
    try:
        db = current_app.config['db']

        user = get_current_user()
        if not user:
            return jsonify ({'msg': 'Unauthorized User'}), 401

        news = [{**doc.to_dict(), "id":doc.id} for doc in db.collection('news').stream()]
        return jsonify({'msg':'Sucessfully fetched all news', 'news': news}), 200
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})
    
@news_bp.route('/delete-news/<id>', methods=["DELETE"])
def delete_news(id):
    try:
        db = current_app.config['db']

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify ({'msg': 'Unauthorized User'}), 401
        
        news_ref = db.collection('news').document(id)

        if not news_ref.get().exists():
            return jsonify ({'msg': 'No Entry Found'}), 404
        
        news_ref.delete()
        
        return jsonify({'msg':'Sucessfully deleted the news'}), 200
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})
    
@news_bp.route('/edit-news/<id>', methods=["PUT"])
def edit_post(id):
    try:
        db = current_app.config['db']
        data = request.json

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify ({'msg': 'Unauthorized User'}), 401
        
        if not data:
            return jsonify ({'msg': 'No data provided'}), 404
        
        updated_info = {}

        reqired_fields = ['title', 'description']

        for field in reqired_fields:
            if field in data:
                updated_info[field] = data[field]
                
        news_ref = db.collection('news').document(id)

        if not news_ref.get().exists():
            return jsonify ({'msg': 'No Entry Found'}), 404
        
        news_ref.update(updated_info)
        return jsonify({'msg':'Sucessfully deleted the News'}), 200
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})