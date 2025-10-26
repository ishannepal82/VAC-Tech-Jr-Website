from flask import Blueprint, jsonify, request, current_app
from firebase_admin import firestore
from app.routes.utils.user_verifier_func import get_current_user
from app.routes.utils.notification_sender import send_notification
import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
def get_all_projects():
    try:
        db = current_app.config['db']
        projects_ref = db.collection('projects')
        projects = [doc.to_dict() | {"id": doc.id} for doc in projects_ref.stream()]
        return jsonify({'msg': 'Successfully fetched all projects', 'projects': projects}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
@projects_bp.route('/get-approved-projects', methods=['GET'])
def get_approved_projects():
    try:
        db = current_app.config['db']
        projects_ref = db.collection('projects')
        approved_projects_ref = projects_ref.where('approved', '==', True)
        approved_projects = [
            doc.to_dict() | {"id": doc.id} for doc in approved_projects_ref.stream()
        ]
        return jsonify({
            'msg': 'Successfully fetched approved projects',
            'projects': approved_projects
        }), 200
    except Exception as e:
        return jsonify({
            'msg': 'Internal server error',
            'error': str(e)
        }), 500

@projects_bp.route('/get-project/<id>', methods=['GET'])
def get_project_by_id(id):
    try:
        db = current_app.config['db']
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'No project found with this id'}), 404
        project = doc.to_dict() | {"id": doc.id}
        return jsonify({'msg': 'Successfully fetched the project', 'project': project}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/create-project', methods=['POST'])
def create_project():
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized User'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400

        required_fields = ["title", "description", "project_timeframe", "committee","required_members"]
        for field in required_fields:
            if field not in data:
                return jsonify({'msg': f"Missing required field: {field}"}), 400

        project_ref = db.collection('projects').document()
        project_ref.set({
            "title": data["title"],
            "description": data["description"],
            "project_timeframe": data["project_timeframe"],
            "author": user["name"],
            "author_email": user['email'],
            "github": data.get("github", ""),
            "committee": data["committee"],
            "is_approved": False,
            "required_members": data["required_members"],
            "unknown_members": [],
            "members": [],
            "points": 0,
            "is_notified": False
        })

        return jsonify({'msg': 'Successfully created the project'}), 201
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/edit-project/<id>', methods=['POST'])
def edit_project(id):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400

        update_payload = {
            field: data[field]
            for field in ["title", "desc", "github", "author", "author_email"]
            if field in data
        }

        if "members" in data and isinstance(data["members"], list):
            update_payload["members"] = data["members"]

        if update_payload:
            project_ref.update(update_payload)

        return jsonify({'msg': 'Successfully edited the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/delete-project/<id>', methods=['DELETE'])
def delete_project(id):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get('is_admin'):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        project_ref.delete()
        return jsonify({'msg': 'Successfully deleted the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/approve-project/<id>', methods=['PUT', 'PATCH'])
def approve_project(id):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get('is_admin'):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        data = request.get_json()
        if not data or "points" not in data:
            return jsonify({'msg': 'Missing points'}), 400

        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404


        points = data["points"]
        project_ref.update({"is_approved": True, "points": points})

        send_notification(
            db,
            "Project Approved",
            f"Your project '{doc.to_dict()['title']}' has been approved with {points} points.",
            doc.to_dict()['author_email'],
            id
        )

        return jsonify({'msg': 'Successfully approved the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/decline-project/<id>', methods=['DELETE', 'POST'])
def decline_project(id):
    try:
        data = request.get_json()

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        if not data or "reason" not in data:
            return jsonify({'msg': 'Missing reason'}), 400
        
        db = current_app.config['db']
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        project_ref.delete()
        send_notification(
            db,
            "Project Declined",
            f"Your project '{doc.to_dict()['title']}' has been declined due to {data['reason']} points.",
            doc.to_dict()['author_email'],
            id
        )

        return jsonify({'msg': 'Successfully declined the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/join-project/<pid>', methods=['PUT'])
def join_project(pid):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized User'}), 401

        uid = user.get('uid')
        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        project_ref.update({"unknown_members": firestore.ArrayUnion([uid])})

        send_notification(
            db,
            "New Join Request",
            f"{user.get('name')} has requested to join your project '{doc.to_dict()['title']}'.",
            "approval",
            doc.to_dict()['author_email'],
            pid
        )

        return jsonify({'msg': 'Successfully requested to join the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/approve_user/<pid>/<uid>', methods=['PUT'])
def approve_user(uid, pid):
    try:
        db = current_app.config['db']
        current_user = get_current_user()
        project_ref = db.collection('projects').document(pid)
        project_doc = project_ref.get()
        if not project_doc.exists:
            return jsonify({'msg': "Project does not exist"}), 404

        project_data = project_doc.to_dict()
        if not current_user or (not current_user.get('is_admin', False) and current_user['email'] != project_data['author_email']):
            return jsonify({'msg': 'Unauthorized User'}), 401

        user_ref = db.collection('Users').document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'msg': "User does not exist"}), 404
        user_data = user_doc.to_dict()

        project_ref.update({
            "unknown_members": firestore.ArrayRemove([uid]),
            "members": firestore.ArrayUnion([user_data['name']])
        })

        send_notification(
            db,
            "Project Membership Approved",
            f"You have been approved to join the project '{project_data['title']}'.",
            "approval",
            user_data['email'],
            pid
        )

        return jsonify({'msg': 'Successfully approved the user for the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/decline_user/<pid>/<uid>', methods=['PUT'])
def decline_user(uid, pid):
    try:
        db = current_app.config['db']

        current_user = get_current_user()
        if not current_user or not current_user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        project_ref = db.collection('projects').document(pid)
        project_doc = project_ref.get()
        if not project_doc.exists:
            return jsonify({'msg': "Project does not exist"}), 404

        project_ref.update({
            "unknown_members": firestore.ArrayRemove([uid])
        })

        return jsonify({'msg': 'Successfully declined the user for the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/mark-completed/<pid>', methods=['PUT'])
def mark_completed(pid):
    try:
        db = current_app.config['db']
        current_user = get_current_user()
        if not current_user or not current_user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        project_ref = db.collection('projects').document(pid)
        project_doc = project_ref.get()
        if not project_doc.exists:
            return jsonify({'msg': "Project does not exist"}), 404
        

        project_ref.update({
            "is_completed": True
        })

        return jsonify({'msg': 'Successfully marked the project as completed'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500