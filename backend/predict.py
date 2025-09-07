from flask import Blueprint, request, jsonify
from PIL import Image
import torch
from torchvision import models, transforms
from db import products_col
import os

predict_bp = Blueprint("predict", __name__, url_prefix="/predict")

# Modelo ResNet18 sin la última capa
base_model = models.resnet18(pretrained=True)
base_model.eval()
model = torch.nn.Sequential(*list(base_model.children())[:-1])

# Preprocesamiento de imágenes
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
])

# Extraer features de una imagen
def extract_features(image_path):
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        features = model(tensor)
    return features.flatten()  # vector 512

# Reconocer producto comparando features
def recognize_product(uploaded_path):
    uploaded_features = extract_features(uploaded_path)
    products = list(products_col.find())
    best_match = None
    min_distance = None

    for p in products:
        if "features" not in p:
            continue
        # Convertir features guardadas a tensor float32
        product_features = torch.tensor(p["features"], dtype=torch.float32)
        distance = torch.dist(uploaded_features, product_features).item()
        print(f"Distancia con {p.get('name')}: {distance}")  # depuración

        if min_distance is None or distance < min_distance:
            min_distance = distance
            best_match = p

    THRESHOLD = 60  # ajustar según pruebas
    if best_match and min_distance < THRESHOLD:
        return {
            "name": best_match.get("name"),
            "brand": best_match.get("brand"),
            "price": best_match.get("price"),
            "description": best_match.get("description"),
            "distance": min_distance
        }
    else:
        return {
            "name": "No reconocido",
            "brand": "-",
            "price": 0,
            "description": "Producto no encontrado"
        }

@predict_bp.route("", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "image requerida"}), 400

    image_file = request.files["image"]
    os.makedirs("./temp", exist_ok=True)
    temp_path = f"./temp/{image_file.filename}"
    image_file.save(temp_path)

    try:
        result = recognize_product(temp_path)
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": f"Error al procesar la imagen: {str(e)}"}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return jsonify(result)