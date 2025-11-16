# create_admin.py
from werkzeug.security import generate_password_hash
from db import users_col

email = "admin@test.com"
password = "admin123"

hashed = generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)

# Borrar cualquier admin anterior
users_col.delete_many({"email": email})

# Insertar admin nuevo con hash correcto
users_col.insert_one({
    "email": email,
    "password": hashed
})

print("Usuario admin creado correctamente")
print("HASH:", hashed)
