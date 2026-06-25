from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base




class User(Base):
    __tablename__ = "tbl_user"
    
    id = Column(Integer, primary_key=True, index=True)
   
    email = Column(String, nullable=False, unique=True, index=True)
    user_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    verify_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    create_datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    uuid = Column(String, nullable=True)
 
    role = Column(String, nullable=True, default='user')
    