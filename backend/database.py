from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure
import os
from dotenv import load_dotenv
import logging
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB Atlas connection string
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = None
db = None

async def create_indexes():
    try:
        # Create indexes with background=True to avoid blocking operations
        await db.users.create_index("email", unique=True, name="unique_email", background=True)
        logger.info("Created email index")
        
        await db.users.create_index("username", unique=True, name="unique_username", background=True)
        logger.info("Created username index")
        
        # First ensure no null IDs exist
        null_id_count = await db.patients.count_documents({"id": None})
        if null_id_count > 0:
            logger.warning(f"Found {null_id_count} patients with null IDs. Please run check_collections.py to fix this issue.")
            return
            
        # Create patient ID index only if no null IDs exist
        await db.patients.create_index("id", unique=True, name="unique_patient_id", background=True)
        logger.info("Created patient ID index")
        
    except OperationFailure as e:
        if "already exists" in str(e):
            logger.info("Indexes already exist, continuing...")
        else:
            logger.error(f"Error creating indexes: {e}")
            raise e
    except Exception as e:
        logger.error(f"Unexpected error creating indexes: {e}")
        raise e

async def init_db():
    global client, db
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to MongoDB Atlas (attempt {attempt + 1}/{max_retries})...")
            
            # Configure client with timeout and retry options
            client = AsyncIOMotorClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=5000,  # 5 seconds timeout
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                maxPoolSize=50,
                minPoolSize=10
            )
            
            db = client[DATABASE_NAME]
            
            # Verify the connection
            await client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB Atlas! Using database: {DATABASE_NAME}")
            
            # Create indexes
            await create_indexes()
            logger.info("Database initialization completed successfully")
            
            return  # Successfully connected
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("Max retries reached. Could not connect to MongoDB Atlas.")
                raise e
        except Exception as e:
            logger.error(f"An unexpected error occurred while initializing the database: {e}")
            raise e

async def close_db():
    if client:
        try:
            logger.info("Closing MongoDB connection")
            client.close()
        except Exception as e:
            logger.error(f"Error while closing database connection: {e}")

def get_db():
    if db is None:
        raise Exception("Database not initialized. Call init_db() first.")
    return db 