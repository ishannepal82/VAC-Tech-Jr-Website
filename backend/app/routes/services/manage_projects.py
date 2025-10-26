from flask import Blueprint, jsonify, request, current_app
from firebase_admin import firestore
from app.routes.utils.user_verifier_func import get_current_user


'''Creating an projects BP'''
projects_bp = Blueprint('projects', __name__)


'''Get Events Route'''
@projects_bp.route('/projects', methods=['GET'])
def get_all_projects():
    try:
        'Creating a db Instance'
        db = current_app.config['db']
        
        '''Creating a ref for projects'''
        projects_ref = db.collection('projects')
        projects = [doc.to_dict() | {"id": doc.id} for doc in projects_ref.stream()]

        return jsonify({'msg': 'Sucessfully fetched all projects', 'projects': projects}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/get-project/<id>', methods=['GET'])
def get_project_by_id(id):
    try:
        'Creating a db Instance'
        db = current_app.config['db']

        '''Creating a ref for projects'''
        projects_ref = db.collection('projects').document(id)
        doc = projects_ref.get()

        if not doc.exists:
            return jsonify({'msg': 'No doc by such id Found'}), 404
        
        project = doc.to_dict() | {"id": doc.id}

        return jsonify({'msg': 'Sucessfully fetched the project', 'project': project}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
@projects_bp.route('/create-project', methods=['POST'])
def create_project():
    try:
        'Creating a db Instance'
        db = current_app.config['db']

        user = get_current_user()
        if not user:
            return jsonify ({'msg': 'Unauthorized User'}), 401

        '''Creating a ref for projects'''
        projects_ref = db.collection('projects').document()
        
        '''Receiving Input from frontend'''
        data = request.get_json()

        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400
        
        required_fields = ["title", "desc", "is_completed", "author", "members", "timeframe", "github", "author_email"]
        for field in required_fields:
            if field not in data:
                return jsonify({'msg': f"Missing the required parameter {field}"}), 400
            elif field == "members" and not len(data['members']):
                return jsonify({'msg': f"Missing the required members name"}), 400

            
        projects_ref.set({
            "title": data["title"],
            "desc": data["desc"],
            "timeframe": data["timeframe"],
            "is_completed": data["is_completed"],
            "author": data["author"],
            "author_email": data["author_email"],
            "github": data["github"],
            "members": data["members"],
            "is_approved": False,
            "unknown_members": [],
            "points": 0
        })

        return jsonify({'msg': 'Sucessfully created the project'}), 201
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
@projects_bp.route('/edit-project/<id>', methods=['POST'])
def edit_project(id):
    try:
        'Creating a db Instance'
        db = current_app.config['db']

        '''Creating a ref for projects'''
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()

        user = get_current_user()
        if not user or not user['is_admin'] or not user['email'] == doc.to_dict()['author_email']: 
            return jsonify ({'msg': "Unauthorized User"}), 401
        '''Receiving Input from frontend'''
        data = request.get_json()

        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400
        
        updated_project = {}

        for field in ["title", "desc", "github", "author", "author_email", "is_completed"]:
            if field in data:
                updated_project[field] = data[field]
        
        update_payload = updated_project.copy()
        if "members" in data and isinstance(data["members"], list):
            project_ref.update({
                "members": firestore.ArrayUnion(data["members"])
            })

        if not doc:
            return jsonify({'msg': 'No such project found '}), 404
        
        if update_payload:
            project_ref.update(update_payload)

        return jsonify({'msg': 'Sucessfully edited the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    

@projects_bp.route('/delete-project/<id>', methods=['DELETE'])
def delete_project(id):
    try:
        'Creating a db Instance'
        db = current_app.config['db']

        # Create a Way of Identifying the person trying to delete is the author himself
        user = get_current_user()
        if not user or not user.is_admin:
            return jsonify ({'msg': 'Unauthorized User'}), 401
        

        '''Creating a ref for projects'''
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        
        '''Checking if the doc exsists'''
        if not doc:
            return jsonify({'msg': "Could not find the project"}), 404
        
        project_ref.delete()

        return jsonify({'msg': 'Sucessfully deleted the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
@projects_bp.route('/approve-project/<id>', methods=['PUT', 'PATCH'])
def approve_project(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Missing JSON data'}), 400
        
        'Creating a db Instance'
        db = current_app.config['db']

        points = data.get('points')
        if not points:
            return jsonify({'msg': 'Missing points'}), 400


        user = get_current_user()
        if not user:
            return jsonify ({'msg': 'Unauthorized User'}), 401
        
        '''Creating a ref for projects'''
        project_ref = db.collection('projects').document(id)
        doc = project_ref.get()
        
        '''Checking if the doc exsists'''
        if not doc:
            return jsonify({'msg': "Could not find the project"}), 404
        
        project_ref.update({
            "is_approved": True,
            "points": points
        })

        return jsonify({'msg': 'Sucessfully deleted the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500

@projects_bp.route('/join-project/<pid>', methods=['PUT'])
def join_project(pid):
    try:
        'Creating a db Instance'
        db = current_app.config['db']

        user = get_current_user()
        if not user:
            return jsonify ({'msg': 'Unauthorized User'}), 401
        uid = user.get('uid')
        
        '''Creating a ref for projects'''
        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()
        
        '''Checking if the doc exsists'''
        if not doc:
            return jsonify({'msg': "Could not find the project"}), 404
        
        project_ref.update({
            "unknown_members": firestore.ArrayUnion([uid])
        })

        return jsonify({'msg': 'Sucessfully joined the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
    
@projects_bp.route('/approve_user/<pid>/<uid>', methods=['PUT'])
def approve_user(uid, pid):
    try:
        'Creating a db Instance'
        db = current_app.config['db']
        user = get_current_user()

        if not user:
            return jsonify({'msg': 'Unauthorized User'}), 401

        '''Creating a ref for projects'''
        user_ref = db.collection('Users').document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'msg': "User does not exist"}), 404
        
        project_ref = db.collection('projects').document(pid)
        doc = project_ref.get()

        if not doc.exists:
            return jsonify({'msg': "Project does not exist"}), 404

        project_ref.update({
            "unknown_members": firestore.ArrayRemove([uid]),
            "members": firestore.ArrayUnion([user_doc.to_dict()['name']])
        })

        return jsonify({'msg': 'Sucessfully deleted the project'}), 200
    except Exception as e:
        return jsonify({'msg': 'Internal server error', 'error': str(e)}), 500
