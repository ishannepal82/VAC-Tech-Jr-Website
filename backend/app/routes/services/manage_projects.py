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

        required_fields = ["title", "desc", "is_completed", "author", "members", "timeframe", "github", "author_email"]
        for field in required_fields:
            if field not in data:
                return jsonify({'msg': f"Missing required field: {field}"}), 400
            elif field == "members" and not data['members']:
                return jsonify({'msg': f"Members list cannot be empty"}), 400

        project_ref = db.collection('projects').document()
        project_ref.set({
            "title": data["title"],
            "desc": data["desc"],
            "timeframe": data["timeframe"],
            "is_completed": data["is_completed"],
            "author": user["name"],
            "author_email": user['email'],
            "github": data["github"],
            "members": data["members"],
            "is_approved": False,
            "unknown_members": [],
            "points": 0
        })

        return jsonify({'msg': 'Successfully created the project'}), 201
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/edit-project/<id>', methods=['POST'])
def edit_project(id):
    try:
        db = current_app.config['db']
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        user = get_current_user()
        if not user or (not user.get('is_admin', False) and user['email'] != doc.to_dict()['author_email']):
            return jsonify({'msg': 'Unauthorized User'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400

        update_payload = {field: data[field] for field in ["title", "desc", "github", "author", "author_email", "is_completed"] if field in data}
        if "members" in data and isinstance(data["members"], list):
            project_ref.update({"members": firestore.ArrayUnion(data["members"])})
        if update_payload:
            project_ref.update(update_payload)

        return jsonify({'msg': 'Successfully edited the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/delete-project/<id>', methods=['DELETE'])
def delete_project(id):
    try:
        db = current_app.config['db']
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        user = get_current_user()
        if not user or (not user.get('is_admin', False) and user['email'] != doc.to_dict()['author_email']):
            return jsonify({'msg': 'Unauthorized User'}), 401

        project_ref.delete()
        return jsonify({'msg': 'Successfully deleted the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/approve-project/<id>', methods=['PUT', 'PATCH'])
def approve_project(id):
    try:
        db = current_app.config['db']
        data = request.get_json()
        if not data or "points" not in data:
            return jsonify({'msg': 'Missing points'}), 400

        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        user = get_current_user()
        if not user or (not user.get('is_admin', False) and user['email'] != doc.to_dict()['author_email']):
            return jsonify({'msg': 'Unauthorized User'}), 401

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
            user_data['email'],
            pid
        )

        return jsonify({'msg': 'Successfully approved the user for the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
