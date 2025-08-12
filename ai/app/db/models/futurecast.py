from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
from datetime import datetime
import uuid

class FuturecastRoadmap(Base):
    __tablename__ = "futurecast_roadmaps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, index=True)
    career_goal = Column(String, nullable=False)
    timeline_years = Column(Integer, nullable=False)
    preferences = Column(JSON)  # Store preferences as JSON
    user_profile = Column(JSON)  # Store user profile data as JSON
    market_data = Column(JSON)  # Store market data as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to paths
    paths = relationship("FuturecastPath", back_populates="roadmap", cascade="all, delete-orphan")

class FuturecastPath(Base):
    __tablename__ = "futurecast_paths"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("futurecast_roadmaps.id"), nullable=False)
    path_id = Column(String, nullable=False)  # e.g., "path1", "path2"
    description = Column(Text, nullable=False)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    roadmap = relationship("FuturecastRoadmap", back_populates="paths")
    milestones = relationship("FuturecastMilestone", back_populates="path", cascade="all, delete-orphan")

class FuturecastMilestone(Base):
    __tablename__ = "futurecast_milestones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    path_id = Column(UUID(as_uuid=True), ForeignKey("futurecast_paths.id"), nullable=False)
    year = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    expected_salary = Column(Float)
    skills_to_learn = Column(JSON)  # Array of skills as JSON
    notes = Column(Text)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    path = relationship("FuturecastPath", back_populates="milestones")

class FuturecastUserPreferences(Base):
    __tablename__ = "futurecast_user_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False)
    work_environment = Column(String)  # remote, hybrid, onsite
    preferred_salary_range_min = Column(Float)
    preferred_salary_range_max = Column(Float)
    location_preferences = Column(JSON)  # Array of preferred locations
    industry_preferences = Column(JSON)  # Array of preferred industries
    company_size_preference = Column(String)  # startup, mid-size, enterprise
    learning_style = Column(String)  # hands-on, theoretical, mixed
    risk_tolerance = Column(String)  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
