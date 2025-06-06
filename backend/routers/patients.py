from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
from models import Patient, PatientCreate, PaginatedPatients
from database import get_db
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=Patient)
async def create_patient(patient: PatientCreate, db=Depends(get_db)):
    try:
        # Create patient document
        patient_dict = patient.model_dump()
        
        # Get current time in IST (UTC+5:30)
        ist_time = datetime.utcnow() + timedelta(hours=5, minutes=30)
        patient_dict["created_at"] = ist_time
        
        # Insert into database
        result = await db.patients.insert_one(patient_dict)
        
        # Get the created patient
        created_patient = await db.patients.find_one({"_id": result.inserted_id})
        if created_patient:
            # Convert ObjectId to string
            created_patient["id"] = str(created_patient["_id"])
            # Convert datetime to ISO format string
            created_patient["created_at"] = created_patient["created_at"].isoformat()
            return created_patient
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve created patient")
            
    except DuplicateKeyError as e:
        error_msg = str(e)
        if "phone" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="A patient with this phone number already exists"
            )
        elif "email" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="A patient with this email already exists"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="A patient with this information already exists"
            )
    except Exception as e:
        logger.error(f"Error creating patient: {e}")
        raise HTTPException(status_code=500, detail="Failed to create patient")

@router.get("/", response_model=PaginatedPatients)
async def get_patients(
    search: str = "",
    page: int = 1,
    limit: int = 10,
    gender: str = None,
    db=Depends(get_db)
):
    try:
        # Build search query
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"_id": {"$regex": search, "$options": "i"}},
                {"chronicConditions": {"$regex": search, "$options": "i"}}
            ]
        if gender and gender != "all":
            query["gender"] = gender

        # Get total count for pagination
        total = await db.patients.count_documents(query)
        
        # Get paginated results
        skip = (page - 1) * limit
        patients = []
        async for patient in db.patients.find(query).skip(skip).limit(limit):
            # Convert ObjectId to string
            patient["id"] = str(patient["_id"])
            # Convert datetime to ISO format string
            if "created_at" in patient:
                patient["created_at"] = patient["created_at"].isoformat()
            patients.append(patient)
            
        return {
            "patients": patients,
            "total": total,
            "page": page,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Error fetching patients: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch patients")

@router.get("/{patient_id}", response_model=Patient)
async def get_patient(patient_id: str, db=Depends(get_db)):
    try:
        patient = await db.patients.find_one({"id": patient_id})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        # Convert ObjectId to string
        patient["id"] = str(patient.pop("_id"))
        return patient
    except Exception as e:
        logger.error(f"Error fetching patient: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch patient")

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str, db=Depends(get_db)):
    try:
        logger.info(f"Attempting to delete patient with ID: {patient_id}")
        
        # Try to find the patient by _id first
        try:
            object_id = ObjectId(patient_id)
            patient = await db.patients.find_one({"_id": object_id})
        except:
            # If ObjectId conversion fails, try finding by id field
            patient = await db.patients.find_one({"id": patient_id})
        
        if not patient:
            logger.warning(f"Patient not found with ID: {patient_id}")
            raise HTTPException(status_code=404, detail="Patient not found")

        # Delete the patient using the correct ID
        if "_id" in patient:
            result = await db.patients.delete_one({"_id": patient["_id"]})
        else:
            result = await db.patients.delete_one({"id": patient_id})
            
        logger.info(f"Delete operation result: {result.raw_result}")
        
        if result.deleted_count == 0:
            logger.warning(f"No patient was deleted with ID: {patient_id}")
            raise HTTPException(status_code=404, detail="Patient not found")
            
        logger.info(f"Successfully deleted patient with ID: {patient_id}")
        return {"message": "Patient deleted successfully"}
    except HTTPException as he:
        logger.error(f"HTTP error while deleting patient: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error deleting patient: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{patient_id}/", response_model=Patient)
async def update_patient(patient_id: str, patient: PatientCreate, db=Depends(get_db)):
    try:
        # Convert patient_id to ObjectId
        try:
            object_id = ObjectId(patient_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid patient ID format")

        # Check if patient exists
        existing_patient = await db.patients.find_one({"_id": object_id})
        if not existing_patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        # Prepare update data
        update_data = patient.model_dump()
        
        # Update the patient
        result = await db.patients.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes were made")

        # Get the updated patient
        updated_patient = await db.patients.find_one({"_id": object_id})
        if updated_patient:
            # Convert ObjectId to string
            updated_patient["id"] = str(updated_patient["_id"])
            # Convert datetime to ISO format string
            if "created_at" in updated_patient:
                updated_patient["created_at"] = updated_patient["created_at"].isoformat()
            return updated_patient
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated patient")

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error updating patient: {e}")
        raise HTTPException(status_code=500, detail="Failed to update patient") 