"""
Contact Submission Model - Store contact form submissions from website
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum as SQLEnum
from datetime import datetime
import enum

from app.core.database import Base


class SubmissionStatus(str, enum.Enum):
    """Status of a contact submission"""
    NEW = "new"
    READ = "read"
    REPLIED = "replied"
    ARCHIVED = "archived"


class ContactSubmission(Base):
    """
    Contact form submissions from the website
    Stored for Manager/Coach review
    """
    __tablename__ = "contact_submissions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Form data
    nom = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    sujet = Column(String(100), nullable=False)  # support, abonnement, feedback, partenariat, media, autre
    message = Column(Text, nullable=False)
    
    # Metadata
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.NEW, nullable=False, index=True)
    source = Column(String(50), default="website")  # website, landing-page, etc.
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    
    # Optional: Link to user if they become a user
    resolved_user_id = Column(Integer, nullable=True)
    
    # Admin notes
    admin_notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<ContactSubmission {self.id} - {self.nom} ({self.sujet})>"
