
def user_rank_checker(points: int) -> str:
    if points < 100:
        return 'Newbie'
    elif points < 350:
        return 'Explorer'
    elif points < 650:
        return 'Builder'
    elif points < 1000:
        return 'Developer'
    else:
        return 'Hacker'

