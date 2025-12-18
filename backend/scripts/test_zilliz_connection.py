import os
import sys
from dotenv import load_dotenv
from pymilvus import connections, utility

def test_zilliz_connection():
    # Load environment variables from project root
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
    if not os.path.exists(env_path):
        print(f"Error: .env file not found at: {env_path}")
        return False
        
    load_dotenv(env_path)
    
    # Get Zilliz credentials from environment
    uri = os.getenv('ZILLIZ_URI')
    token = os.getenv('ZILLIZ_TOKEN')
    
    print(f"Loading .env from: {env_path}")
    print(f"ZILLIZ_URI: {'*' * 20 + uri[-8:] if uri else 'Not set'}")
    print(f"ZILLIZ_TOKEN: {'*' * 20 + token[-8:] if token else 'Not set'}")
    
    if not uri or not token:
        print("Error: ZILLIZ_URI and ZILLIZ_TOKEN must be set in .env file")
        print("Please create a .env file in the project root with these variables")
        return False
    
    try:
        # Connect to Zilliz
        print(f"Connecting to Zilliz cluster at: {uri}")
        connections.connect("default", uri=uri, token=token)
        
        # List all collections
        collections = utility.list_collections()
        print("\nSuccessfully connected to Zilliz!")
        print(f"Available collections: {collections}")
        
        # Check if our target collection exists
        target_collection = os.getenv('ZILLIZ_COLLECTION', 'internships')
        if target_collection in collections:
            print(f"\nCollection '{target_collection}' exists!")
            # Get collection info
            from pymilvus import Collection
            collection = Collection(name=target_collection)
            print(f"Schema: {collection.schema}")
            print(f"Number of records: {collection.num_entities}")
        else:
            print(f"\nCollection '{target_collection}' does not exist yet.")
            print("You can create it when you add your first internship.")
        
        return True
        
    except Exception as e:
        print(f"\nError connecting to Zilliz: {str(e)}")
        print("\nTroubleshooting steps:")
        print("1. Verify your ZILLIZ_URI and ZILLIZ_TOKEN in the .env file")
        print("2. Make sure your Zilliz cluster is running and accessible")
        print("3. Check if your IP is whitelisted in Zilliz Cloud")
        return False
    finally:
        # Always disconnect
        if 'connections' in locals():
            connections.disconnect("default")

if __name__ == "__main__":
    # Add project root to Python path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    print("=== Zilliz Connection Test ===")
    success = test_zilliz_connection()
    if success:
        print("\n✅ Zilliz connection test completed successfully!")
    else:
        print("\n❌ Zilliz connection test failed. Please check the error messages above.")
