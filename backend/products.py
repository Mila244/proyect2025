from flask import Blueprint, request, jsonify, send_from_directory
from bson import ObjectId
from db import products_col, iot_products_col  # Colección normal y de eventos IoT
import os
from werkzeug.utils import secure_filename
from predict import extract_features
from datetime import datetime

products_bp = Blueprint("products", __name__, url_prefix="/products")
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------
# LISTA GLOBAL PARA PRODUCTOS IoT EN MEMORIA
# -----------------------------
registros = []

# -----------------------------
# FUNCIÓN PARA GUARDAR PRODUCTOS IoT
# -----------------------------
def guardar_producto(data):
    # Asignar fecha/hora si no viene
    if "fechaHora" not in data or not data["fechaHora"]:
        data["fechaHora"] = datetime.now().isoformat()

    # Agregar a memoria para /iot
    registros.append(data)

    # Evitar duplicados por idRegistro y fechaHora
    query = {"idRegistro": data.get("idRegistro"), "fechaHora": data.get("fechaHora")}
    if not iot_products_col.find_one(query):
        doc = {
            "idRegistro": data.get("idRegistro"),
            "idProducto": data.get("idProducto"),
            "name": data.get("nombre", ""),
            "brand": data.get("marca", ""),
            "price": float(data.get("precio", 0)),
            "fechaHora": data.get("fechaHora"),
            "description": data.get("descripcion", ""),
            "imageUrl": "",
            "imagePath": "",
            "features": []
        }
        iot_products_col.insert_one(doc)
        print("Producto IoT guardado en DB:", data)
    else:
        print("Producto ya registrado, no se inserta:", data)

# ============================
# CRUD TRADICIONAL (DB NORMAL)
# ============================
@products_bp.route("", methods=["GET"])
def list_products():
    items = []
    for p in products_col.find():
        p["_id"] = str(p["_id"])
        items.append(p)
    return jsonify(items)

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

@products_bp.route("/<pid>", methods=["DELETE"])
def delete_product(pid):
    products_col.delete_one({"_id": ObjectId(pid)})
    return jsonify({"message": "eliminado"})

@products_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ============================
# ENDPOINTS PARA PRODUCTOS IoT
# ============================

@products_bp.route("/iot", methods=["GET"])
def list_iot_products():
    """Devuelve todos los eventos IoT guardados en memoria"""
    return jsonify(registros)

@products_bp.route("/iot/db", methods=["GET"])
def list_iot_products_db():
    """Devuelve todos los eventos IoT guardados en MongoDB"""
    items = []
    for p in iot_products_col.find().sort("fechaHora", 1):
        p["_id"] = str(p["_id"])
        items.append(p)
    return jsonify(items)
