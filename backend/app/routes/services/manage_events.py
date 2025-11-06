from flask import Blueprint, jsonify, request, current_app
from app.routes.utils.user_verifier_func import get_current_user
events_bp = Blueprint('events', __name__)

@events_bp.route('/events')
def get_all_events():
    try:
        user = get_current_user()
        if not user:
            return jsonify ({'msg': 'Unauthorized User'}), 401
        
        db = current_app.config['db']
        events_ref = db.collection('events')
        events_list = [{'id': doc.id, **doc.to_dict()} for doc in events_ref.stream()]

        events_by_date = []
        for events in events_list:
            events_by_date.append(events)
        
        return jsonify({'msg':'Sucessfully fetched all events', 'events': events_by_date}), 200

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
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user = get_current_user()
        if not user or not  user.get('is_admin', False):
            return jsonify ({'msg': 'Unauthorized User'})

        
        required_fields = ["name", "description", "date",  "venue", "time", "date"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        doc_ref = db.collection('events').document() 
        doc_ref.set({
            "name": data.get("name"),
            "description": data.get('description'),
            "date": data.get('date'),
            "time": data.get('time'),
            "venue": data.get('venue'),
            "status": "upcoming"
        })

        return jsonify({'msg':'Sucessfully created the event'}), 201
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})
    
@events_bp.route('/edit-events/<id>', methods=["POST"])
def edit_event(id):
    try:
        db = current_app.config['db']
        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        user = get_current_user()
        if not user.get('is_admin', False) or not user:
            return jsonify ({'msg': 'Unauthorized User'})

        updated_info = {}
        
        update_fields = ["name", "description", "date", "venue", "time", "status"]
        for field in update_fields:
            if field in data:
                updated_info[field] = data[field]
               
        doc_ref = db.collection('events').document(id)
        event_doc = doc_ref.get() 
        if not event_doc.exists:
            return jsonify({'msg': 'Missing event, event might have been deleted'}), 404
        
        doc_ref.update(updated_info)
        return jsonify({'msg':'Sucessfully updated the event'}), 200
    
    except Exception as e:
        return jsonify({'msg':'Internal Server error', 'error': str(e)})

@events_bp.route('/delete-event/<id>', methods=["DELETE"])
def delete_event(id):
    try:
        db = current_app.config['db']
        
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401

        doc_ref = db.collection('events').document(id)
        event_doc = doc_ref.get()
        if not event_doc.exists:
            return jsonify({'msg': 'Event not found or already deleted'}), 404

        doc_ref.delete()
        return jsonify({'msg': 'Successfully deleted the event'}), 200

    except Exception as e:
        return jsonify({'msg': 'Internal Server error', 'error': str(e)}), 500
