
def update_points(points: int, members: list):
    if points == 0 or len(members) == 0:
        return 0
    else:
        return int(points / len(members))