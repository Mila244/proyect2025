from flask import Flask, jsonify
from flask_cors import CORS
from auth import auth_bp
from products import products_bp, registros, iot_products_col  # Importar registros y colección IoT
from predict import predict_bp
from protected import protected_bp
import threading
import mqtt_listener  # Nuestro listener MQTT con función run()

app = Flask(__name__)
CORS(app)

# Registrar blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(protected_bp)

# -------------------------------
# Iniciar MQTT en hilo aparte
# -------------------------------
mqtt_thread = threading.Thread(target=mqtt_listener.run)
mqtt_thread.daemon = True  # Para que cierre al cerrar Flask
mqtt_thread.start()

# -------------------------------
# Endpoint para listar productos IoT en dashboard
# -------------------------------
@app.route("/api/productos", methods=["GET"])
def listar_productos():
    """
    Devuelve todos los productos IoT registrados en MongoDB,
    ordenados por fecha y hora.
    """
    items = []
    for p in iot_products_col.find().sort("fechaHora", 1):
        p["_id"] = str(p["_id"])
        items.append(p)
    return jsonify(items)


if __name__ == "__main__":
    app.run(debug=True)
