import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fimiku_core.settings')
django.setup()

from store.mongo_client import test_mongo_connection, sync_catalog_to_mongo, get_mongo_db

def main():
    print("==================================================")
    print("[MongoDB Atlas] Fimiku Diagnostic & Sync Tool")
    print("==================================================")
    
    mongo_uri = os.getenv('MONGODB_URI', '').strip()
    db_name = os.getenv('MONGODB_DB_NAME', 'fimiku_db').strip()

    if not mongo_uri:
        print("[Status] MONGODB_URI is not set in backend/.env")
        print("Please add your MongoDB Atlas connection string to backend/.env:")
        print("MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fimiku_db?retryWrites=true&w=majority\n")
        return

    # Mask password for display
    masked_uri = mongo_uri
    if "@" in mongo_uri and "://" in mongo_uri:
        prefix = mongo_uri.split("://")[0]
        after_proto = mongo_uri.split("://")[1]
        user_part = after_proto.split("@")[0]
        host_part = after_proto.split("@")[1]
        user = user_part.split(":")[0] if ":" in user_part else user_part
        masked_uri = f"{prefix}://{user}:******@{host_part}"

    print(f"[Connecting] URI: {masked_uri}")
    print(f"[Database] Target: {db_name}")
    print("Testing connection to MongoDB Atlas cluster...")

    result = test_mongo_connection()
    if result.get("connected"):
        print(f"[Success] Connected to MongoDB Atlas! Server Version: {result.get('version')}")
        print("\nSyncing Django relational catalog to MongoDB Atlas...")
        success, msg = sync_catalog_to_mongo()
        if success:
            print(f"[Synced] {msg}")
            db = get_mongo_db()
            if db is not None:
                print(f" - Categories count: {db['categories'].count_documents({})}")
                print(f" - Products count:   {db['products'].count_documents({})}")
                print(f" - Coupons count:    {db['coupons'].count_documents({})}")
        else:
            print(f"[Sync Warning] {msg}")
    else:
        print(f"[Connection Failed] {result.get('error')}")
        print("\nChecklist:")
        print("1. Ensure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 or Current IP).")
        print("2. Ensure username & password in MONGODB_URI are correct.")
        print("3. Ensure database user has readWriteAnyDatabase or dbAdmin permissions.")

if __name__ == '__main__':
    main()
