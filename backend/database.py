"""
Database Manager - Per-user SQLite with SQLAlchemy models
Each user gets isolated database with full CRM schema
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from fastapi import Header, HTTPException
import os

# ══════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════

DB_DIR = os.path.join(os.path.dirname(__file__), "user_databases")
os.makedirs(DB_DIR, exist_ok=True)

Base = declarative_base()

# Session cache
_sessions = {}
_engines = {}

# ══════════════════════════════════════════════════════════════
# MODELS
# ══════════════════════════════════════════════════════════════

class Contact(Base):
    """Contact/Lead entity"""
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50))
    mobile = Column(String(50))
    title = Column(String(100))
    department = Column(String(100))
    company_id = Column(Integer, index=True)
    linkedin_url = Column(String(255))
    twitter_handle = Column(String(100))
    street = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    status = Column(String(50), default="lead", index=True)
    lead_source = Column(String(100))
    lead_score = Column(Integer, default=0)
    tags = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Company(Base):
    """Company/Account entity"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    website = Column(String(255))
    industry = Column(String(100), index=True)
    company_size = Column(String(50))
    annual_revenue = Column(Float)
    phone = Column(String(50))
    email = Column(String(255))
    street = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    company_type = Column(String(50), default="prospect", index=True)
    priority = Column(String(20), default="medium")
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Deal(Base):
    """Deal/Opportunity entity"""
    __tablename__ = "deals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    value = Column(Float, nullable=False)
    stage = Column(String(50), default="qualification", index=True)
    status = Column(String(20), default="open", index=True)
    probability = Column(Integer, default=10)
    expected_close_date = Column(Date)
    actual_close_date = Column(Date)
    contact_id = Column(Integer, index=True)
    company_id = Column(Integer, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Activity(Base):
    """Activity entity (calls, meetings, tasks, etc.)"""
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    description = Column(Text)
    activity_date = Column(DateTime, nullable=False, index=True)
    duration_minutes = Column(Integer)
    contact_id = Column(Integer, index=True)
    company_id = Column(Integer, index=True)
    deal_id = Column(Integer, index=True)
    status = Column(String(50), default="pending", index=True)
    priority = Column(String(20), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Note(Base):
    """Note entity for attachments to contacts/companies/deals"""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    contact_id = Column(Integer, index=True)
    company_id = Column(Integer, index=True)
    deal_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# ══════════════════════════════════════════════════════════════
# DATABASE FUNCTIONS
# ══════════════════════════════════════════════════════════════

def get_db_path(user_id: str) -> str:
    """Get database file path for user"""
    return os.path.join(DB_DIR, f"crm_{user_id}.db")


def init_user_db(user_id: str) -> str:
    """
    Initialize new SQLite database for user
    Creates all tables and returns path
    """
    db_path = get_db_path(user_id)
    
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Cache engine
    _engines[user_id] = engine
    
    return db_path


def get_engine(user_id: str):
    """Get or create engine for user"""
    if user_id in _engines:
        return _engines[user_id]
    
    db_path = get_db_path(user_id)
    
    # Initialize if doesn't exist
    if not os.path.exists(db_path):
        return create_engine(
            f"sqlite:///{db_path}",
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )
    
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    
    _engines[user_id] = engine
    return engine


def get_session(user_id: str) -> Session:
    """Get or create session for user"""
    if user_id in _sessions:
        return _sessions[user_id]
    
    engine = get_engine(user_id)
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    _sessions[user_id] = session
    return session


def get_db(user_id: str = Header(..., alias="X-User-ID")):
    """
    FastAPI dependency for database session
    Extracts user_id from X-User-ID header
    """
    from utils import validate_user_id
    
    if not validate_user_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    db_path = get_db_path(user_id)
    if not os.path.exists(db_path):
        # Auto-initialize if doesn't exist
        init_user_db(user_id)
    
    session = get_session(user_id)
    
    try:
        yield session
    except Exception as e:
        session.rollback()
        raise
    finally:
        # Don't close - keep session alive
        pass


def get_db_info(user_id: str) -> dict:
    """
    Get database information and statistics
    """
    db_path = get_db_path(user_id)
    
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail="User database not found")
    
    # File size
    file_size = os.path.getsize(db_path)
    
    # Get counts
    session = get_session(user_id)
    
    contacts_count = session.query(Contact).count()
    companies_count = session.query(Company).count()
    deals_count = session.query(Deal).count()
    activities_count = session.query(Activity).count()
    notes_count = session.query(Note).count()
    
    return {
        "user_id": user_id,
        "database_path": db_path,
        "file_size_bytes": file_size,
        "file_size_mb": round(file_size / (1024 * 1024), 2),
        "record_counts": {
            "contacts": contacts_count,
            "companies": companies_count,
            "deals": deals_count,
            "activities": activities_count,
            "notes": notes_count,
            "total": contacts_count + companies_count + deals_count + activities_count + notes_count
        },
        "created_at": datetime.fromtimestamp(os.path.getctime(db_path)).isoformat()
    }


def close_all():
    """Close all sessions and engines (cleanup)"""
    for session in _sessions.values():
        session.close()
    _sessions.clear()
    
    for engine in _engines.values():
        engine.dispose()
    _engines.clear()


def delete_user_db(user_id: str) -> bool:
    """Delete user's database file"""
    # Close session/engine if exists
    if user_id in _sessions:
        _sessions[user_id].close()
        del _sessions[user_id]
    
    if user_id in _engines:
        _engines[user_id].dispose()
        del _engines[user_id]
    
    db_path = get_db_path(user_id)
    
    if os.path.exists(db_path):
        os.remove(db_path)
        return True
    
    return False


def list_all_users() -> list:
    """List all user database IDs"""
    user_ids = []
    
    for filename in os.listdir(DB_DIR):
        if filename.startswith("crm_") and filename.endswith(".db"):
            user_id = filename[4:-3]
            user_ids.append(user_id)
    
    return user_ids


def backup_user_db(user_id: str, backup_path: str):
    """Create backup of user database"""
    import shutil
    
    db_path = get_db_path(user_id)
    
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database for user {user_id} not found")
    
    shutil.copy2(db_path, backup_path)
    return backup_path


def restore_user_db(user_id: str, backup_path: str):
    """Restore user database from backup"""
    import shutil
    
    if not os.path.exists(backup_path):
        raise FileNotFoundError(f"Backup file {backup_path} not found")
    
    # Close existing connections
    if user_id in _sessions:
        _sessions[user_id].close()
        del _sessions[user_id]
    
    if user_id in _engines:
        _engines[user_id].dispose()
        del _engines[user_id]
    
    db_path = get_db_path(user_id)
    shutil.copy2(backup_path, db_path)
    
    return db_path


# ══════════════════════════════════════════════════════════════
# QUERY HELPERS
# ══════════════════════════════════════════════════════════════

def get_contact_with_company(session: Session, contact_id: int):
    """Get contact with company name"""
    contact = session.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        return None
    
    result = {
        **{c.name: getattr(contact, c.name) for c in Contact.__table__.columns},
        "full_name": f"{contact.first_name} {contact.last_name}",
        "company_name": None
    }
    
    if contact.company_id:
        company = session.query(Company).filter(Company.id == contact.company_id).first()
        if company:
            result["company_name"] = company.name
    
    return result


def get_company_with_counts(session: Session, company_id: int):
    """Get company with contact/deal counts"""
    company = session.query(Company).filter(Company.id == company_id).first()
    if not company:
        return None
    
    contact_count = session.query(Contact).filter(Contact.company_id == company_id).count()
    deal_count = session.query(Deal).filter(Deal.company_id == company_id).count()
    
    result = {
        **{c.name: getattr(company, c.name) for c in Company.__table__.columns},
        "contact_count": contact_count,
        "deal_count": deal_count
    }
    
    return result