import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

 
from models.crud import combine_vless_url, populate_sub_for_all_users
from models.model import User, VlessUrl
from database import get_db
def test_combine_vless_url(user_id: int):
    """
    Test the combine_vless_url function
    """
    db = next(get_db())
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")
    vless_urls = db.query(VlessUrl).filter(VlessUrl.user_id == user.id).all()
    combined_vless_url = combine_vless_url(db, user_id)

    # INSERT_YOUR_CODE
 
    print(combined_vless_url[0])
    print(combined_vless_url[1])
    
def test_populate_sub_for_all_users():
    """
    Test the populate_sub_for_all_users function
    """
    db = next(get_db())
    populate_sub_for_all_users(db)
    
if __name__ == "__main__":
    # Example main test run
    user_id = 1  # Change this to an existing user id in your test database
    #test_combine_vless_url(2)
    test_populate_sub_for_all_users()
