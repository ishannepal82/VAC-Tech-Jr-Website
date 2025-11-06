import datetime
from firebase_admin import firestore

def send_notification(db, title, message, notification_type, to_email, project_id, from_email="ishannepal", uid="ishannepal", read_status=False):
    try:
        db.collection('notifications').add({
            "title": title,
            "message": message,
            "type": notification_type,
            "to_email": to_email,
            "project_id": project_id,
            "from_email": from_email,
            "read_status": read_status,
            "uid": uid,
            "created_at": firestore.SERVER_TIMESTAMP  # Better than utcnow() for Firestore
        })
    except Exception as e:
        # Log error if needed
        print(f"Error sending notification: {str(e)}")