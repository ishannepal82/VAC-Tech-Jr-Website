from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
events_bp = Blueprint('events', __name__)

@events_bp.route('/events')
def get_all_events():
    try:
        db = current_app.config['db']
        events_ref = db.collection('events')

        events_list = [{'id': doc.id, **doc.to_dict()} for doc in events_ref.stream()]

        events_by_date = {}
        for ev in events_list:
            date_key = ev.get('date')
            if not date_key:
                continue
            if date_key not in events_by_date:
                events_by_date[date_key] = []

            events_by_date[date_key].append({
                'id': ev['id'],
                'title': ev.get('title') or ev.get('Title'),
                'desc': ev.get('description'),
                'color': ev.get('color', 'yellow')
            })

        return jsonify(events_by_date), 200

    except Exception as e:
        return jsonify({'msg': 'Internal Server error', 'error': str(e)}), 500
    
@events_bp.route('/get-event/<id>')
def get_event_by_id(id):
    try:
        db = current_app.config['db']
       
        exsisting_document = db.collection('Events').document(id).get()

        if not exsisting_document.exists:
            return jsonify({'msg': 'Missing event, event might have been deleted'}), 404
        event = {'id': exsisting_document.id, **exsisting_document.to_dict()}
    
        return jsonify({'msg':'Sucessfully fetched the event', 'event': event}), 200
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})
    

@events_bp.route('/add-event', methods=["POST"])
def add_event():
    try:
        db = current_app.config['db']
        data = request.json

        user = get_current_user()
        if not user.get('is_admin', False) or not user:
            return jsonify ({'msg': 'Unauthorized User'})

        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["title", "description", "date",  "color"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        doc_ref = db.collection('events').document() 
        doc_ref.set({
            "title": data["title"],
            "description": data["description"],
            "date": data["date"],
            "color": data["color"]
        })

        return jsonify({'msg':'Sucessfully created the event'}), 201
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})
    
@events_bp.route('/edit-events/<id>', methods=["POST"])
def edit_event(id):
    try:
        db = current_app.config['db']
        data = request.json

        user = get_current_user()
        if not user.get('is_admin', False) or not user:
            return jsonify ({'msg': 'Unauthorized User'})

        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["title", "description", "date",  "color"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        doc_ref = db.collection('events').document() 
        doc_ref.set({
            "title": data["title"],
            "description": data["description"],
            "date": data["date"],
            "color": data["color"]
        })

        return jsonify({'msg':'Sucessfully created the event'}), 201
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})

