"""
CRM Backend - Complete FastAPI Application
Professional Salesforce-style CRM with per-user SQLite databases
"""

from fastapi import FastAPI, Depends, HTTPException, Query, Header, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
import io
import csv

from database import (
    get_db, init_user_db, get_db_path, get_db_info,
    Contact, Company, Deal, Activity, Note
)
from utils import (
    generate_user_id, validate_user_id, calculate_lead_score,
    format_currency, get_date_range, export_to_csv
)

# ══════════════════════════════════════════════════════════════
# APP SETUP
# ══════════════════════════════════════════════════════════════

app = FastAPI(
    title="CRM API",
    description="Professional CRM System with per-user databases",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════
# SCHEMAS
# ══════════════════════════════════════════════════════════════

class ContactSchema(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    mobile: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    company_id: Optional[int] = None
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    status: str = Field("lead", pattern="^(lead|prospect|customer|partner)$")
    lead_source: Optional[str] = None
    lead_score: int = Field(0, ge=0, le=100)
    tags: Optional[str] = None
    notes: Optional[str] = None

class ContactResponse(ContactSchema):
    id: int
    full_name: str
    company_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CompanySchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = Field(None, pattern="^(1-10|11-50|51-200|201-500|501-1000|1000\\+)$")
    annual_revenue: Optional[float] = Field(None, ge=0)
    phone: Optional[str] = None
    email: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    company_type: str = Field("prospect", pattern="^(prospect|customer|partner|vendor)$")
    priority: str = Field("medium", pattern="^(low|medium|high|critical)$")
    description: Optional[str] = None

class CompanyResponse(CompanySchema):
    id: int
    contact_count: int = 0
    deal_count: int = 0
    total_revenue: float = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DealSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    value: float = Field(..., ge=0)
    stage: str = Field("qualification", pattern="^(qualification|needs_analysis|proposal|negotiation|closed_won|closed_lost)$")
    status: str = Field("open", pattern="^(open|won|lost)$")
    probability: int = Field(10, ge=0, le=100)
    expected_close_date: Optional[date] = None
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None

class DealResponse(DealSchema):
    id: int
    contact_name: Optional[str] = None
    company_name: Optional[str] = None
    weighted_value: float = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ActivitySchema(BaseModel):
    activity_type: str = Field(..., pattern="^(call|email|meeting|task|note)$")
    subject: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    activity_date: datetime
    duration_minutes: Optional[int] = Field(None, ge=0)
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    deal_id: Optional[int] = None
    status: str = Field("pending", pattern="^(pending|completed|cancelled)$")
    priority: str = Field("medium", pattern="^(low|medium|high|critical)$")

class ActivityResponse(ActivitySchema):
    id: int
    contact_name: Optional[str] = None
    company_name: Optional[str] = None
    deal_title: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class NoteSchema(BaseModel):
    content: str = Field(..., min_length=1)
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    deal_id: Optional[int] = None

class NoteResponse(NoteSchema):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ══════════════════════════════════════════════════════════════
# USER & DATABASE MANAGEMENT
# ══════════════════════════════════════════════════════════════

@app.post("/api/user/init")
def initialize_user():
    """Initialize new user database and return user_id"""
    user_id = generate_user_id()
    db_path = init_user_db(user_id)
    
    return {
        "user_id": user_id,
        "database_path": db_path,
        "message": "User initialized successfully. Store user_id in localStorage."
    }

@app.get("/api/user/database/info")
def get_database_info(user_id: str = Header(..., alias="X-User-ID")):
    """Get database statistics and information"""
    if not validate_user_id(user_id):
        raise HTTPException(400, "Invalid user ID")
    
    return get_db_info(user_id)

@app.get("/api/user/database/download")
def download_database(user_id: str = Header(..., alias="X-User-ID")):
    """Download SQLite database file"""
    if not validate_user_id(user_id):
        raise HTTPException(400, "Invalid user ID")
    
    db_path = get_db_path(user_id)
    
    return FileResponse(
        path=db_path,
        filename=f"crm_{user_id[:8]}.db",
        media_type="application/x-sqlite3"
    )

@app.post("/api/user/database/upload")
async def upload_database(
    file: UploadFile = File(...),
    user_id: str = Header(..., alias="X-User-ID")
):
    """Upload/restore database from file"""
    if not validate_user_id(user_id):
        raise HTTPException(400, "Invalid user ID")
    
    if not file.filename.endswith('.db'):
        raise HTTPException(400, "File must be a .db file")
    
    db_path = get_db_path(user_id)
    
    # Save uploaded file
    with open(db_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"message": "Database restored successfully"}

# ══════════════════════════════════════════════════════════════
# CONTACTS API
# ══════════════════════════════════════════════════════════════

@app.get("/api/contacts", response_model=List[ContactResponse])
def list_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    status: Optional[str] = None,
    company_id: Optional[int] = None,
    lead_source: Optional[str] = None,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    sort_by: str = Query("created_at", pattern="^(created_at|updated_at|last_name|lead_score)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """List contacts with advanced filtering"""
    
    query = db.query(Contact)
    
    # Search
    if search:
        query = query.filter(
            or_(
                Contact.first_name.ilike(f"%{search}%"),
                Contact.last_name.ilike(f"%{search}%"),
                Contact.email.ilike(f"%{search}%"),
                Contact.title.ilike(f"%{search}%")
            )
        )
    
    # Filters
    if status:
        query = query.filter(Contact.status == status)
    if company_id:
        query = query.filter(Contact.company_id == company_id)
    if lead_source:
        query = query.filter(Contact.lead_source == lead_source)
    if min_score is not None:
        query = query.filter(Contact.lead_score >= min_score)
    
    # Sorting
    sort_column = getattr(Contact, sort_by)
    query = query.order_by(desc(sort_column) if sort_order == "desc" else sort_column)
    
    contacts = query.offset(skip).limit(limit).all()
    
    # Enrich with company names
    result = []
    for contact in contacts:
        contact_dict = ContactResponse.from_orm(contact).dict()
        contact_dict["full_name"] = f"{contact.first_name} {contact.last_name}"
        
        if contact.company_id:
            company = db.query(Company).filter(Company.id == contact.company_id).first()
            contact_dict["company_name"] = company.name if company else None
        
        result.append(ContactResponse(**contact_dict))
    
    return result

@app.get("/api/contacts/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Get single contact with details"""
    
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(404, "Contact not found")
    
    contact_dict = ContactResponse.from_orm(contact).dict()
    contact_dict["full_name"] = f"{contact.first_name} {contact.last_name}"
    
    if contact.company_id:
        company = db.query(Company).filter(Company.id == contact.company_id).first()
        contact_dict["company_name"] = company.name if company else None
    
    return ContactResponse(**contact_dict)

@app.post("/api/contacts", response_model=ContactResponse, status_code=201)
def create_contact(
    contact: ContactSchema,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Create new contact"""
    
    # Check email uniqueness
    existing = db.query(Contact).filter(Contact.email == contact.email).first()
    if existing:
        raise HTTPException(400, "Email already exists")
    
    # Auto-calculate lead score if not provided
    if contact.lead_score == 0:
        contact.lead_score = calculate_lead_score(contact.dict())
    
    db_contact = Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    return get_contact(db_contact.id, user_id, db)

@app.put("/api/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact: ContactSchema,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Update contact"""
    
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(404, "Contact not found")
    
    # Check email uniqueness
    if contact.email != db_contact.email:
        existing = db.query(Contact).filter(Contact.email == contact.email).first()
        if existing:
            raise HTTPException(400, "Email already exists")
    
    for key, value in contact.dict().items():
        setattr(db_contact, key, value)
    
    db_contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_contact)
    
    return get_contact(contact_id, user_id, db)

@app.delete("/api/contacts/{contact_id}")
def delete_contact(
    contact_id: int,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Delete contact"""
    
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(404, "Contact not found")
    
    db.delete(contact)
    db.commit()
    
    return {"message": "Contact deleted successfully"}

@app.get("/api/contacts/export/csv")
def export_contacts_csv(
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Export contacts to CSV"""
    
    contacts = db.query(Contact).all()
    
    csv_data = export_to_csv(
        contacts,
        fields=['id', 'first_name', 'last_name', 'email', 'phone', 'title', 'company_id', 'status', 'lead_score']
    )
    
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=contacts_{user_id[:8]}.csv"}
    )

# ══════════════════════════════════════════════════════════════
# COMPANIES API
# ══════════════════════════════════════════════════════════════

@app.get("/api/companies", response_model=List[CompanyResponse])
def list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    company_type: Optional[str] = None,
    industry: Optional[str] = None,
    priority: Optional[str] = None,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """List companies with filtering"""
    
    query = db.query(Company)
    
    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))
    if company_type:
        query = query.filter(Company.company_type == company_type)
    if industry:
        query = query.filter(Company.industry == industry)
    if priority:
        query = query.filter(Company.priority == priority)
    
    companies = query.offset(skip).limit(limit).all()
    
    # Enrich with counts
    result = []
    for company in companies:
        company_dict = CompanyResponse.from_orm(company).dict()
        
        contact_count = db.query(Contact).filter(Contact.company_id == company.id).count()
        deals = db.query(Deal).filter(Deal.company_id == company.id).all()
        
        company_dict["contact_count"] = contact_count
        company_dict["deal_count"] = len(deals)
        company_dict["total_revenue"] = sum(d.value for d in deals if d.status == "won")
        
        result.append(CompanyResponse(**company_dict))
    
    return result

@app.post("/api/companies", response_model=CompanyResponse, status_code=201)
def create_company(
    company: CompanySchema,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Create new company"""
    
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    
    return CompanyResponse.from_orm(db_company)

@app.get("/api/companies/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Get company details"""
    
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(404, "Company not found")
    
    return CompanyResponse.from_orm(company)

@app.delete("/api/companies/{company_id}")
def delete_company(
    company_id: int,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Delete company"""
    
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(404, "Company not found")
    
    db.delete(company)
    db.commit()
    
    return {"message": "Company deleted successfully"}

# ══════════════════════════════════════════════════════════════
# DEALS API
# ══════════════════════════════════════════════════════════════

@app.get("/api/deals", response_model=List[DealResponse])
def list_deals(
    skip: int = 0,
    limit: int = 50,
    stage: Optional[str] = None,
    status: Optional[str] = None,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """List deals with filtering"""
    
    query = db.query(Deal)
    
    if stage:
        query = query.filter(Deal.stage == stage)
    if status:
        query = query.filter(Deal.status == status)
    
    deals = query.offset(skip).limit(limit).all()
    
    # Enrich
    result = []
    for deal in deals:
        deal_dict = DealResponse.from_orm(deal).dict()
        deal_dict["weighted_value"] = deal.value * (deal.probability / 100)
        
        if deal.contact_id:
            contact = db.query(Contact).filter(Contact.id == deal.contact_id).first()
            deal_dict["contact_name"] = f"{contact.first_name} {contact.last_name}" if contact else None
        
        if deal.company_id:
            company = db.query(Company).filter(Company.id == deal.company_id).first()
            deal_dict["company_name"] = company.name if company else None
        
        result.append(DealResponse(**deal_dict))
    
    return result

@app.post("/api/deals", response_model=DealResponse, status_code=201)
def create_deal(
    deal: DealSchema,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Create new deal"""
    
    db_deal = Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    return DealResponse.from_orm(db_deal)

@app.delete("/api/deals/{deal_id}")
def delete_deal(
    deal_id: int,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Delete deal"""
    
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(404, "Deal not found")
    
    db.delete(deal)
    db.commit()
    
    return {"message": "Deal deleted successfully"}

# ══════════════════════════════════════════════════════════════
# ACTIVITIES API
# ══════════════════════════════════════════════════════════════

@app.get("/api/activities", response_model=List[ActivityResponse])
def list_activities(
    skip: int = 0,
    limit: int = 50,
    activity_type: Optional[str] = None,
    status: Optional[str] = None,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """List activities"""
    
    query = db.query(Activity)
    
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if status:
        query = query.filter(Activity.status == status)
    
    return query.order_by(desc(Activity.activity_date)).offset(skip).limit(limit).all()

@app.post("/api/activities", response_model=ActivityResponse, status_code=201)
def create_activity(
    activity: ActivitySchema,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Create new activity"""
    
    db_activity = Activity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    return ActivityResponse.from_orm(db_activity)

# ══════════════════════════════════════════════════════════════
# DASHBOARD & STATS
# ══════════════════════════════════════════════════════════════

@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics"""
    
    # Counts
    total_contacts = db.query(Contact).count()
    total_companies = db.query(Company).count()
    total_deals = db.query(Deal).count()
    total_activities = db.query(Activity).count()
    
    # Deal metrics
    open_deals = db.query(Deal).filter(Deal.status == "open").all()
    pipeline_value = sum(d.value for d in open_deals)
    weighted_pipeline = sum(d.value * (d.probability / 100) for d in open_deals)
    
    won_deals = db.query(Deal).filter(Deal.status == "won").all()
    total_revenue = sum(d.value for d in won_deals)
    
    # Contact metrics
    leads = db.query(Contact).filter(Contact.status == "lead").count()
    prospects = db.query(Contact).filter(Contact.status == "prospect").count()
    customers = db.query(Contact).filter(Contact.status == "customer").count()
    
    # Recent activities
    recent_activities = db.query(Activity).order_by(desc(Activity.created_at)).limit(5).all()
    
    return {
        "totals": {
            "contacts": total_contacts,
            "companies": total_companies,
            "deals": total_deals,
            "activities": total_activities
        },
        "pipeline": {
            "total_value": pipeline_value,
            "weighted_value": weighted_pipeline,
            "open_deals": len(open_deals),
            "total_revenue": total_revenue,
            "won_deals": len(won_deals)
        },
        "contacts": {
            "leads": leads,
            "prospects": prospects,
            "customers": customers
        },
        "recent_activities": [
            {
                "id": a.id,
                "type": a.activity_type,
                "subject": a.subject,
                "date": a.activity_date
            }
            for a in recent_activities
        ]
    }

@app.get("/")
def root():
    return {
        "name": "CRM API",
        "version": "1.0.0",
        "docs": "/docs"
    }