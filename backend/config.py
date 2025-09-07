import os

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://mila_user:mila123456@cluster0.isbfti7.mongodb.net/beautystock?retryWrites=true&w=majority"
)
DB_NAME = os.getenv("DB_NAME", "beautystock")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_change_me")