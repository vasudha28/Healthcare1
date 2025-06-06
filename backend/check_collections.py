from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
import logging
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB Atlas connection string
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def check_database():
    try:
        logger.info("Attempting to connect to MongoDB Atlas...")
        client = AsyncIOMotorClient(MONGODB_URL)
        
        # Test the connection
        await client.admin.command('ping')
        logger.info("✅ Successfully connected to MongoDB Atlas!")
        
        # Get database
        db = client[DATABASE_NAME]
        logger.info(f"Using database: {DATABASE_NAME}")
        
        # Get all collections
        collections = await db.list_collection_names()
        logger.info("\nAvailable Collections:")
        for collection in collections:
            count = await db[collection].count_documents({})
            logger.info(f"- {collection}: {count} documents")
        
        # Check users collection specifically
        if "users" in collections:
            logger.info("\nUser Details:")
            users = await db.users.find().to_list(length=None)
            if users:
                for user in users:
                    logger.info("\n" + "="*30)
                    logger.info(f"Username: {user.get('username')}")
                    logger.info(f"Email: {user.get('email')}")
                    logger.info(f"Created at: {user.get('created_at')}")
                    logger.info(f"Active: {user.get('is_active')}")
                    logger.info("="*30)
            else:
                logger.info("No users found in the database.")
        else:
            logger.info("\nNo users collection found.")
            
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
    finally:
        if 'client' in locals():
            client.close()
            logger.info("Database connection closed.")

async def check_and_fix_patients():
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Find all patients with null id
        patients_with_null_id = await db.patients.find({"id": None}).to_list(length=None)
        logger.info(f"Found {len(patients_with_null_id)} patients with null id")
        
        # Fix each patient document
        for patient in patients_with_null_id:
            # Generate a new ObjectId and convert to string
            new_id = str(ObjectId())
            # Update the document
            await db.patients.update_one(
                {"_id": patient["_id"]},
                {"$set": {"id": new_id}}
            )
            logger.info(f"Updated patient {patient['_id']} with new id: {new_id}")
        
        # Close the connection
        client.close()
        logger.info("Successfully checked and fixed patients collection")
        
    except Exception as e:
        logger.error(f"Error checking/fixing patients collection: {e}")
        raise e

if __name__ == "__main__":
    asyncio.run(check_database())
    asyncio.run(check_and_fix_patients()) 