# db.py
from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# ✅ Definir directamente las colecciones como variables
users_col = db["users"]
products_col = db["products"]