from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Patient Models
class Prescription(BaseModel):
    date: str
    medication: str
    dosage: str
    notes: Optional[str] = None

class Appointment(BaseModel):
    date: str
    department: str
    doctor: str

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    dob: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    chronicConditions: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    prescriptions: List[Prescription] = []
    appointments: List[Appointment] = []

class Patient(PatientBase):
    id: str
    prescriptions: List[Prescription] = []
    appointments: List[Appointment] = []
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedPatients(BaseModel):
    patients: List[Patient]
    total: int
    page: int
    total_pages: int

    class Config:
        from_attributes = True 