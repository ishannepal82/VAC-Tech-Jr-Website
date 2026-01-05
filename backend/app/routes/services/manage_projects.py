from flask import Blueprint, jsonify, request, current_app
from firebase_admin import firestore
from app.routes.utils.user_verifier_func import get_current_user
from app.routes.utils.notification_sender import send_notification
import datetime
import re

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
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized'}), 401
        db = current_app.config['db']
        projects_ref = db.collection('projects')
        approved_projects_ref = projects_ref.where('is_approved', '==', True)
        
        frontend_projects = []
        for doc in approved_projects_ref.stream():
            data = doc.to_dict()
            
            project = {
                "id": doc.id,
                "title": data.get("title", "Untitled Project"), 
                "author": data.get("author", "Anonymous"),
                "description": data.get("description", "No description available."),  
                "points": data.get("points", 0),
                "committee": data.get("committee", "General"),
                "author_email": data.get("author_email", ""),
                "github": data.get("github", ""),
                "is_approved": True,  
                "project_timeframe": data.get("project_timeframe", "Not specified"),
                "required_members": data.get("required_members", 1),
                "members": [],
                "is_completed": data.get("is_completed", False)
            }

            raw_members = data.get("members", [])
            if isinstance(raw_members, list):
                project["members"] = [{"name": str(m)} for m in raw_members if isinstance(m, str)]
                frontend_projects.append(project)

        return jsonify({
            'msg': 'Successfully fetched approved projects',
            'projects': frontend_projects
        }), 200

    except Exception as e:
        print(f"Error in get_approved_projects: {str(e)}")  
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

        required_fields = [
            ("title", str),
            ("description", str),
            ("project_timeframe", str),
            ("committee", str),
            ("required_members", int)
        ]

        for field, expected_type in required_fields:
            if field not in data:
                return jsonify({'msg': f"Missing required field: {field}"}), 400
            if not isinstance(data[field], expected_type):
                return jsonify({'msg': f"Field '{field}' must be of type {expected_type.__name__}"}), 400

        if data["required_members"] < 1:
            return jsonify({'msg': 'required_members must be at least 1'}), 400

        timeframe_str = data["project_timeframe"].strip()
        iso_pattern = r'^(\d{4}-\d{2}-\d{2})(?:\s*to\s*(\d{4}-\d{2}-\d{2}))?$'
        match = re.fullmatch(iso_pattern, timeframe_str)
        
        if not match:
            return jsonify({
                'msg': 'Invalid project_timeframe format. Use "yyyy-mm-dd" or "yyyy-mm-dd to yyyy-mm-dd"'
            }), 400

        start_str = match.group(1)
        end_str = match.group(2)

        try:
            start_date = datetime.datetime.fromisoformat(start_str)
            end_date = datetime.datetime.fromisoformat(end_str) if end_str else None
        except ValueError as e:
            return jsonify({'msg': f'Invalid date: {str(e)}'}), 400

        if end_date and end_date < start_date:
            return jsonify({'msg': 'End date cannot be before start date'}), 400

        if end_str:
            display_timeframe = f"{start_str} to {end_str}"
        else:
            display_timeframe = start_str

        project_ref = db.collection('projects').document()
        project_ref.set({
            "title": data["title"].strip(),              
            "description": data["description"].strip(),         
            "project_timeframe": display_timeframe,      
            "author": user["name"],
            "author_email": user['email'],
            "github": data.get("github", "").strip(),
            "committee": data["committee"].strip(),
            "approved": False,                           
            "is_approved": False,                        
            "required_members": data["required_members"],
            "unknown_members": [],
            "members": [],
            "points": 0,
            "is_notified": False,
            "is_completed": False,
            "completion_requested": False,
            "completion_request_date": None,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return jsonify({'msg': 'Successfully created the project'}), 201

    except Exception as e:
        print(f"Create project error: {str(e)}")  
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/edit-project/<id>', methods=['PUT'])
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
            for field in ["title", "description", "github", "author", "author_email", "points"]
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
            db=db,
            title="Project Approved",
            message=f"Your project '{doc.to_dict().get('title','')}' has been approved with {points} points.",
            notification_type="info",                    
            to_email=doc.to_dict().get('author_email',''),      
            project_id=id,                               
            from_email="admin@yourclub.edu"              
        )
        author_uid = doc.to_dict().get('author_uid', None)
        if not author_uid:
            email = doc.to_dict().get('author_email')
            users_ref = db.collection('Users').where('email', '==', email)
            for u in users_ref.stream():
                author_uid = u.id

        if author_uid:
            db.collection('contributions').add({
                "uid": author_uid,
                "name": doc.to_dict().get("author", ""),
                "title" : f"Intialzed Project {doc.to_dict().get("title", "")}",
                "timestamp": firestore.SERVER_TIMESTAMP
            })

        return jsonify({'msg': 'Successfully approved the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/decline-project/<pid>', methods=['DELETE', 'POST'])
def decline_project(pid):
    try:
        data = request.get_json()

        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401
        
        if not data or "reason" not in data:
            return jsonify({'msg': 'Missing reason'}), 400
        
        db = current_app.config['db']
        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404
        
        project_ref.update({
            "is_declined": True,
            "decline_reason": data["reason"]
        })

        send_notification(
            db,
            "Project Declined",
            f"Your project '{doc.to_dict().get('title','')}' has been declined due to {data['reason']}",
            "info",
            doc.to_dict().get('author_email',''),
            pid
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
        
        if len(doc.to_dict()['members']) == doc.to_dict()['required_members']:
            return jsonify({'msg': 'Project is full'}), 400
        
        if uid in doc.to_dict()['members'] or uid in doc.to_dict()['unknown_members']:
            return jsonify({'msg': 'You are already a member of this project'}), 400

        project_ref.update({"unknown_members": firestore.ArrayUnion([uid])})

        send_notification(
            db,
            "New Join Request",
            f"{user.get('name')} has requested to join your project '{doc.to_dict().get('title','')}'.",
            "approval",
            doc.to_dict().get('author_email',''),
            pid,
            user.get('email'),
            user.get('uid')
        )

        return jsonify({'msg': 'Successfully requested to join the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/approve_user/<pid>/<uid>', methods=['PUT'])
def approve_user(pid, uid):
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
            "info", 
            user_data['email'],
            pid,
            current_user.get('email', 'admin@email.com')
        )
        # Log contribution
        db.collection('contributions').add({
            "uid": uid,
            "name": user_data.get("name", ""),
            "project_id": pid,
            "project_title": project_data.get("title", ""),
            "points": project_data.get("points", 0),
            "type": "project_join",
            "timestamp": firestore.SERVER_TIMESTAMP
        })
        # ----------------------------------------------------

        return jsonify({'msg': 'Successfully approved the user for the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/decline_user/<pid>/<uid>', methods=['PUT'])
def decline_user(pid, uid):
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
    
@projects_bp.route('/projects/user/get-projects', methods=['GET'])
def get_user_projects():
    try:
        user = get_current_user()   
        if not user:
            return jsonify({'msg': 'Unauthorized User'}), 401
        uid = user.get('uid')
        db = current_app.config['db']

        project_ref = db.collection('projects')
        author_ref = db.collection('Users').document(uid)
        author = author_ref.get().to_dict()

        author_email = author.get('email', '')
        docs = project_ref.where('author_email', '==', author_email, ).where('is_approved', '==', True).stream()
        projects = []
        for doc in docs:
            projects.append({"id": doc.id, **doc.to_dict()})
        print(projects)
        return jsonify({'projects': projects}), 200
    except Exception as e:
        print(e)
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/projects/request-completion/<pid>', methods=['POST'])
def request_completion(pid):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user:
            return jsonify({'msg': 'Unauthorized User'}), 401

        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        project_data = doc.to_dict()
        if project_data.get('author_email') != user['email']:
            return jsonify({'msg': 'Only the project author can request completion'}), 403

        if project_data.get('is_completed', False):
            return jsonify({'msg': 'Project is already marked as completed'}), 400

        if project_data.get('completion_requested', False):
            return jsonify({'msg': 'Completion request already made'}), 400
        
        project_ref.update({
            "completion_requested": True,
            "completion_request_date": datetime.datetime.now(),
            "completion_requester": user['name']
        })

        send_notification(
            db,
            "Project Completion Requested",
            f"The project '{project_data['title']}' by {project_data['author']} has requested completion.",
            "admin",
            "admin",  
            pid
        )

        return jsonify({'msg': 'Successfully requested project completion'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500


@projects_bp.route('/projects/<pid>/approve-completion', methods=['PUT'])
def approve_completion(pid):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401

        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        project_data = doc.to_dict()
        if not project_data.get('completion_requested', False):
            return jsonify({'msg': 'No completion request found for this project'}), 400

        project_ref.update({
            "is_completed": True,
            "completion_requested": False,
            "completion_approval_date": datetime.datetime.now()
        })

        send_notification(
            db,
            "Project Completion Approved",
            f"Your project '{project_data['title']}' has been approved as completed.",
            "info",
            project_data['author_email'],
            pid
        )

        return jsonify({'msg': 'Successfully approved project completion'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/projects/<pid>/decline-completion', methods=['PUT'])
def decline_completion(pid):
    try:
        db = current_app.config['db']
        user = get_current_user()
        if not user or not user.get('is_admin', False):
            return jsonify({'msg': 'Unauthorized User'}), 401

        data = request.get_json()
        if not data or "reason" not in data:
            return jsonify({'msg': 'Missing decline reason'}), 400

        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({'msg': 'Project not found'}), 404

        project_data = doc.to_dict()
        if not project_data.get('completion_requested', False):
            return jsonify({'msg': 'No completion request found for this project'}), 400

        project_ref.update({
            "completion_requested": False,
            "completion_decline_reason": data["reason"]
        })

        send_notification(
            db,
            "Project Completion Declined",
            f"Your project '{project_data['title']}' has been declined for completion due to: {data['reason']}.",
            "info",
            project_data['author_email'],
            pid
        )

        return jsonify({'msg': 'Successfully declined project completion'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
