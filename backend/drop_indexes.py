from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import logging
import os
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def drop_indexes():
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Drop indexes from users collection
        await db.users.drop_indexes()
        logger.info("Dropped indexes from users collection")
        
        # Drop indexes from patients collection
        await db.patients.drop_indexes()
        logger.info("Dropped indexes from patients collection")
        
        # Close the connection
        client.close()
        logger.info("Successfully dropped all indexes")
        
    except Exception as e:
        logger.error(f"Error dropping indexes: {e}")
        raise e

if __name__ == "__main__":
    asyncio.run(drop_indexes()) 