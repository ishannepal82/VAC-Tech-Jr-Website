import datetime
def send_notification(db, title, message, type, to_email, project_id):
    db.collection('notifications').add({
        "title": title,
        "message": message,
        "type": type,
        "to_email": to_email,
        "project_id": project_id,
        "created_at": datetime.datetime.utcnow()
    })
