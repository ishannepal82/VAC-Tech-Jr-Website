from datetime import datetime, timezone
from flask import current_app 
from app.routes.utils.notification_sender import send_notification

def send_admin_notifications(user):
    db = current_app.config['db']
    now = datetime.now(timezone.utc)

    projects_ref = db.collection('projects')
    due_projects = projects_ref.where('project_timeframe', '<=', now).stream()

    for doc in due_projects:
        project = doc.to_dict()

        project_ts_str = project.get('timestamp')
        if not project_ts_str:
            continue  # skip if no timestamp
        project_ts = datetime.strptime(project_ts_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        if project.get('is_notified', False):
            continue
  
        if project_ts > now:
            continue

        doc.reference.update({"notified_admin": True})



    



    