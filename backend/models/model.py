from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base



class Address(Base):
    __tablename__ = "tbl_address"
    
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    zip = Column(String, nullable=True)
    country = Column(String, nullable=True)


class Organization(Base):
    __tablename__ = "tbl_organization"
    
    id = Column(Integer, primary_key=True, index=True)
    org_name = Column(String, nullable=True)
    org_desc = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=True)
    address_id = Column(Integer, ForeignKey("tbl_address.id"), nullable=True)
    create_datetime = Column(DateTime, nullable=True)
    status = Column(String(length=20), server_default='pending', nullable=True)
    is_public = Column(Boolean, nullable=True)
    token = Column(String(length=36), nullable=True)
    verified = Column(Boolean, nullable=True)
    logo = Column(Text, nullable=True)
    
    # Relationship to users belonging to this organization
    users = relationship("User", back_populates="organization")


class User(Base):
    __tablename__ = "tbl_user"
    
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=True)
    password = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=True)
    create_datetime = Column(DateTime, nullable=True)
    org_id = Column(Integer, ForeignKey("tbl_organization.id"), nullable=True)
    email = Column(String(length=150), nullable=True)
    role = Column(String(length=20), nullable=True)
    title = Column(String(length=20), nullable=True)
    alias_name = Column(String(length=20), nullable=True)
    name = Column(String(length=30), nullable=True)
    password_reset_token = Column(String(length=36), nullable=True)
    
    # Relationship back to the organization
    organization = relationship("Organization", back_populates="users")


# Invitation table has been removed - table dropped in migration d4fd6821b58d
# class Invitation(Base):
#     __tablename__ = "tbl_invitation"
#     
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String(length=100), nullable=True)
#     is_active = Column(Boolean, server_default='1', nullable=True)
#     create_datetime = Column(DateTime, nullable=True)
#     token = Column(String(length=60), nullable=True)
#     organization = Column(String(length=100), nullable=True)