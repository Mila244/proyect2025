from flask import Blueprint, request, jsonify, send_from_directory
from bson import ObjectId
from db import products_col
import os
from werkzeug.utils import secure_filename
from predict import extract_features  # usar el modelo para generar features

products_bp = Blueprint("products", __name__, url_prefix="/products")
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Listar productos
@products_bp.route("", methods=["GET"])
def list_products():
    items = []
    for p in products_col.find():
        p["_id"] = str(p["_id"])
        items.append(p)
    return jsonify(items)

# Crear producto
@products_bp.route("", methods=["POST"])
def create_product():
    name = request.form.get("name")
    brand = request.form.get("brand")
    price = request.form.get("price")
    description = request.form.get("description")
    image = request.files.get("image")

    if not all([name, brand, price, description, image]):
        return jsonify({"error": "faltan campos"}), 400

    filename = secure_filename(image.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    image.save(save_path)
    image_url = f"/uploads/{filename}"

    # Extraer features
    features = extract_features(save_path).tolist()

    doc = {
        "name": name,
        "brand": brand,
        "price": float(price),
        "description": description,
        "imageUrl": image_url,
        "imagePath": os.path.abspath(save_path),
        "features": features
    }

    res = products_col.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return jsonify(doc), 201

# Actualizar producto
@products_bp.route("/<pid>", methods=["PUT"])
def update_product(pid):
    data = request.form or {}
    update = {}
    for k in ["name", "brand", "price", "description"]:
        if k in data:
            update[k] = data[k]
    if "price" in update:
        update["price"] = float(update["price"])

    image = request.files.get("image")
    if image:
        filename = secure_filename(image.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(save_path)
        update["imageUrl"] = f"/uploads/{filename}"
        update["imagePath"] = os.path.abspath(save_path)
        update["features"] = extract_features(save_path).tolist()

    products_col.update_one({"_id": ObjectId(pid)}, {"$set": update})
    doc = products_col.find_one({"_id": ObjectId(pid)})
    if not doc:
        return jsonify({"error": "no encontrado"}), 404
    doc["_id"] = str(doc["_id"])
    return jsonify(doc)

# Eliminar producto
@products_bp.route("/<pid>", methods=["DELETE"])
def delete_product(pid):
    products_col.delete_one({"_id": ObjectId(pid)})
    return jsonify({"message": "eliminado"})

# Servir imágenes
@products_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
