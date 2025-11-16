# db.py
from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_col = db["users"]
products_col = db["products"]
iot_products_col = db["products_iot"]
