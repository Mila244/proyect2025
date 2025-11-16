from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt, datetime
from config import JWT_SECRET
from db import users_col

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    print("Intentando login con:", email, password)

    # ✔ FIX FINAL: esto sí funciona
    user = users_col.find_one({"email": email})

    if not user:
        print("Usuario no encontrado")
        return jsonify({"error": "credenciales inválidas"}), 401

    if not check_password_hash(user["password"], password):
        print("❌ Contraseña incorrecta")
        return jsonify({"error": "credenciales inválidas"}), 401

    token = jwt.encode(
        {
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        },
        JWT_SECRET,
        algorithm="HS256"
    )

    return jsonify({"token": token})
