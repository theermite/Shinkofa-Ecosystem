#!/usr/bin/env python3
"""
Create all database tables for Shizen-Planner service
"""
from app.core.database import engine, Base
from app.models import (
    Task,
    Project,
    DailyJournal,
    Ritual,
    QuestionnaireSession,
    QuestionnaireResponse,
    HolisticProfile,
    UploadedChart,
    ConversationSession,
    Message,
)

def create_all_tables():
    """Create all tables in the database"""
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    create_all_tables()
