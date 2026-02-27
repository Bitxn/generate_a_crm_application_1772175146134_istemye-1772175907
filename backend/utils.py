"""
Utility Functions - Helper functions for CRM operations
"""

import uuid
import hashlib
import re
import csv
import io
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional

# ══════════════════════════════════════════════════════════════
# USER ID MANAGEMENT
# ══════════════════════════════════════════════════════════════

def generate_user_id() -> str:
    """Generate unique user ID (UUID4)"""
    return str(uuid.uuid4())


def validate_user_id(user_id: str) -> bool:
    """Validate user ID format"""
    try:
        uuid.UUID(user_id, version=4)
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def hash_user_id(user_id: str) -> str:
    """Create SHA256 hash of user ID (for filenames)"""
    return hashlib.sha256(user_id.encode()).hexdigest()[:16]


# ══════════════════════════════════════════════════════════════
# VALIDATION
# ══════════════════════════════════════════════════════════════

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate phone number"""
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    return cleaned.isdigit() and 7 <= len(cleaned) <= 15


def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url, re.IGNORECASE))


# ══════════════════════════════════════════════════════════════
# FORMATTING
# ══════════════════════════════════════════════════════════════

def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency for display"""
    symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "INR": "₹"
    }
    symbol = symbols.get(currency, currency + " ")
    return f"{symbol}{amount:,.2f}"


def format_phone(phone: str, format_type: str = "US") -> str:
    """Format phone number"""
    digits = re.sub(r'\D', '', phone)
    
    if format_type == "US" and len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif format_type == "US" and len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    
    return phone


def format_percentage(value: float) -> str:
    """Format as percentage"""
    return f"{value:.1f}%"


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


# ══════════════════════════════════════════════════════════════
# DATE/TIME UTILITIES
# ══════════════════════════════════════════════════════════════

def format_date(dt: datetime, format_str: str = "%Y-%m-%d") -> str:
    """Format datetime to string"""
    return dt.strftime(format_str)


def format_datetime(dt: datetime) -> str:
    """Format datetime with time"""
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def parse_date(date_str: str) -> date:
    """Parse ISO date string"""
    return datetime.fromisoformat(date_str).date()


def get_date_range(period: str) -> tuple:
    """Get start and end dates for period"""
    now = datetime.utcnow()
    
    ranges = {
        "today": (
            now.replace(hour=0, minute=0, second=0),
            now.replace(hour=23, minute=59, second=59)
        ),
        "yesterday": (
            (now - timedelta(days=1)).replace(hour=0, minute=0, second=0),
            (now - timedelta(days=1)).replace(hour=23, minute=59, second=59)
        ),
        "this_week": (
            now - timedelta(days=now.weekday()),
            now
        ),
        "this_month": (
            now.replace(day=1, hour=0, minute=0, second=0),
            now
        ),
        "last_30_days": (
            now - timedelta(days=30),
            now
        ),
        "this_year": (
            now.replace(month=1, day=1, hour=0, minute=0, second=0),
            now
        )
    }
    
    return ranges.get(period, (now - timedelta(days=30), now))


def days_until(target: date) -> int:
    """Calculate days until target date"""
    today = date.today()
    delta = target - today
    return delta.days


def is_overdue(target: date) -> bool:
    """Check if date is past"""
    return target < date.today()


def get_quarter(dt: datetime) -> int:
    """Get fiscal quarter (1-4)"""
    return (dt.month - 1) // 3 + 1


# ══════════════════════════════════════════════════════════════
# CRM-SPECIFIC CALCULATIONS
# ══════════════════════════════════════════════════════════════

def calculate_lead_score(contact_data: dict) -> int:
    """
    Calculate lead score (0-100) based on contact data
    Higher score = better quality lead
    """
    score = 0
    
    # Company association
    if contact_data.get('company_id'):
        score += 20
    
    # Job title
    if contact_data.get('title'):
        score += 10
        title_lower = contact_data['title'].lower()
        if any(term in title_lower for term in ['ceo', 'cto', 'cfo', 'vp', 'director', 'head']):
            score += 10
        if any(term in title_lower for term in ['president', 'founder', 'owner']):
            score += 15
    
    # Contact info
    if contact_data.get('phone'):
        score += 10
    if contact_data.get('mobile'):
        score += 5
    
    # Social presence
    if contact_data.get('linkedin_url'):
        score += 15
    if contact_data.get('twitter_handle'):
        score += 5
    
    # Complete address
    if all(contact_data.get(f) for f in ['street', 'city', 'state', 'country']):
        score += 10
    
    # Lead source quality
    source = contact_data.get('lead_source', '').lower()
    if source in ['referral', 'partner']:
        score += 15
    elif source in ['web', 'campaign', 'event']:
        score += 5
    
    # Corporate email (not free)
    email = contact_data.get('email', '')
    if email and not any(d in email.lower() for d in ['gmail', 'yahoo', 'hotmail', 'outlook']):
        score += 10
    
    return min(score, 100)


def calculate_deal_weighted_value(value: float, probability: int) -> float:
    """Calculate weighted deal value"""
    return value * (probability / 100)


def get_deal_stage_number(stage: str) -> int:
    """Get stage number for sorting"""
    stages = {
        'qualification': 1,
        'needs_analysis': 2,
        'proposal': 3,
        'negotiation': 4,
        'closed_won': 5,
        'closed_lost': 6
    }
    return stages.get(stage.lower(), 0)


def calculate_pipeline_metrics(deals: List[dict]) -> dict:
    """Calculate pipeline metrics"""
    open_deals = [d for d in deals if d.get('status') == 'open']
    
    total_value = sum(d.get('value', 0) for d in open_deals)
    weighted_value = sum(
        calculate_deal_weighted_value(d.get('value', 0), d.get('probability', 0))
        for d in open_deals
    )
    
    won_deals = [d for d in deals if d.get('status') == 'won']
    total_revenue = sum(d.get('value', 0) for d in won_deals)
    
    return {
        'total_value': total_value,
        'weighted_value': weighted_value,
        'open_count': len(open_deals),
        'total_revenue': total_revenue,
        'won_count': len(won_deals)
    }


def get_activity_priority_number(priority: str) -> int:
    """Get priority number for sorting"""
    priorities = {
        'low': 1,
        'medium': 2,
        'high': 3,
        'critical': 4
    }
    return priorities.get(priority.lower(), 2)


# ══════════════════════════════════════════════════════════════
# STRING UTILITIES
# ══════════════════════════════════════════════════════════════

def clean_string(text: str) -> str:
    """Clean and normalize string"""
    if not text:
        return ""
    return " ".join(text.split()).strip()


def slugify(text: str) -> str:
    """Convert to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def parse_tags(tags_str: Optional[str]) -> List[str]:
    """Parse comma-separated tags"""
    if not tags_str:
        return []
    return [t.strip() for t in tags_str.split(',') if t.strip()]


def format_tags(tags_list: List[str]) -> str:
    """Format tags to comma-separated string"""
    return ', '.join(t.strip() for t in tags_list if t.strip())


def extract_domain(email: str) -> str:
    """Extract domain from email"""
    if '@' in email:
        return email.split('@')[1].lower()
    return ""


def get_initials(first_name: str, last_name: str) -> str:
    """Get initials from name"""
    return f"{first_name[0]}{last_name[0]}".upper() if first_name and last_name else ""


# ══════════════════════════════════════════════════════════════
# EXPORT/IMPORT
# ══════════════════════════════════════════════════════════════

def export_to_csv(records: List, fields: List[str]) -> str:
    """Export records to CSV string"""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields)
    
    writer.writeheader()
    for record in records:
        row = {}
        for field in fields:
            value = getattr(record, field, None)
            if isinstance(value, datetime):
                value = value.isoformat()
            row[field] = value
        writer.writerow(row)
    
    return output.getvalue()


def parse_csv_row(row: dict, field_types: dict) -> dict:
    """Parse CSV row with type conversion"""
    parsed = {}
    
    for field, value in row.items():
        if field not in field_types:
            parsed[field] = value
            continue
        
        field_type = field_types[field]
        
        try:
            if field_type == 'int':
                parsed[field] = int(value) if value else None
            elif field_type == 'float':
                parsed[field] = float(value) if value else None
            elif field_type == 'bool':
                parsed[field] = value.lower() in ['true', '1', 'yes'] if value else False
            elif field_type == 'date':
                parsed[field] = datetime.fromisoformat(value).date() if value else None
            elif field_type == 'datetime':
                parsed[field] = datetime.fromisoformat(value) if value else None
            else:
                parsed[field] = value
        except (ValueError, TypeError):
            parsed[field] = None
    
    return parsed


def sanitize_filename(filename: str) -> str:
    """Sanitize filename"""
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = filename.strip('. ')
    return filename[:255] or 'untitled'


# ══════════════════════════════════════════════════════════════
# PAGINATION
# ══════════════════════════════════════════════════════════════

def calculate_pagination(total: int, page: int = 1, per_page: int = 50) -> dict:
    """Calculate pagination metadata"""
    total_pages = (total + per_page - 1) // per_page
    
    return {
        'total_items': total,
        'total_pages': total_pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': page < total_pages,
        'has_prev': page > 1,
        'next_page': page + 1 if page < total_pages else None,
        'prev_page': page - 1 if page > 1 else None
    }


def get_skip_limit(page: int = 1, per_page: int = 50) -> tuple:
    """Convert page to skip/limit"""
    skip = (page - 1) * per_page
    return (skip, per_page)


# ══════════════════════════════════════════════════════════════
# STATISTICS
# ══════════════════════════════════════════════════════════════

def calculate_average(values: List[float]) -> float:
    """Calculate average"""
    return sum(values) / len(values) if values else 0


def calculate_growth_rate(current: float, previous: float) -> float:
    """Calculate growth rate percentage"""
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return ((current - previous) / previous) * 100


def calculate_conversion_rate(converted: int, total: int) -> float:
    """Calculate conversion rate percentage"""
    return (converted / total * 100) if total > 0 else 0.0


# ══════════════════════════════════════════════════════════════
# FILTERS & SEARCH
# ══════════════════════════════════════════════════════════════

def build_search_filter(search_term: str, fields: List[str]) -> str:
    """Build SQL LIKE filter for search"""
    return f"%{search_term}%"


def parse_filter_params(params: dict) -> dict:
    """Parse and validate filter parameters"""
    filters = {}
    
    for key, value in params.items():
        if value is not None and value != '':
            filters[key] = value
    
    return filters


# ══════════════════════════════════════════════════════════════
# COLOR CODING (for UI)
# ══════════════════════════════════════════════════════════════

def get_status_color(status: str) -> str:
    """Get color for status"""
    colors = {
        'lead': 'blue',
        'prospect': 'yellow',
        'customer': 'green',
        'partner': 'purple',
        'open': 'blue',
        'won': 'green',
        'lost': 'red',
        'pending': 'yellow',
        'completed': 'green',
        'cancelled': 'red'
    }
    return colors.get(status.lower(), 'gray')


def get_priority_color(priority: str) -> str:
    """Get color for priority"""
    colors = {
        'low': 'green',
        'medium': 'yellow',
        'high': 'orange',
        'critical': 'red'
    }
    return colors.get(priority.lower(), 'gray')


def get_score_color(score: int) -> str:
    """Get color based on lead score"""
    if score >= 80:
        return 'green'
    elif score >= 50:
        return 'yellow'
    elif score >= 30:
        return 'orange'
    else:
        return 'red'