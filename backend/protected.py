from flask import Blueprint, jsonify
from auth_middleware import token_required

protected_bp = Blueprint("protected", __name__)

@protected_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    return jsonify({"message": "Bienvenido al dashboard protegido 🚀"})
