import json
import time
import paho.mqtt.client as mqtt
from products import guardar_producto  # Función que guarda en memoria y en MongoDB
from datetime import datetime

# -----------------------
# Configuración MQTT
# -----------------------
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883
MQTT_TOPIC = "tiendas/tu_r_l/productos"

# -----------------------
# Callbacks MQTT
# -----------------------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Conectado al broker MQTT correctamente")
        client.subscribe(MQTT_TOPIC)
        print(f"Suscrito al topic: {MQTT_TOPIC}")
    else:
        print("Error de conexión MQTT, rc=", rc)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)

        # Asignar fecha/hora si no viene del sensor
        if "fechaHora" not in data:
            data["fechaHora"] = datetime.now().isoformat()

        print("Mensaje recibido:", data)
        guardar_producto(data)  # Guarda en memoria y en MongoDB
    except Exception as e:
        print("Error al procesar mensaje MQTT:", e)

def on_disconnect(client, userdata, rc):
    print("Desconectado del broker MQTT, rc=", rc)
    # Reconectar automáticamente
    while True:
        try:
            print("Intentando reconectar en 5 segundos...")
            time.sleep(5)
            client.reconnect()
            print("Reconectado al broker MQTT")
            break
        except Exception as e:
            print("Error al reconectar:", e)

# -----------------------
# Cliente MQTT
# -----------------------
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

# Retrasos automáticos para reconexión
client.reconnect_delay_set(min_delay=1, max_delay=10)

# Intentos iniciales de conexión
print("Conectando al broker MQTT...")
for i in range(5):
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        break
    except Exception as e:
        print(f"No se pudo conectar (intento {i+1}/5):", e)
        time.sleep(5)

# Mantener el loop en segundo plano
client.loop_start()

# Función para integrar con Flask si quieres correr MQTT en hilo separado
def run():
    """Función para iniciar MQTT desde Flask usando threading"""
    client.loop_forever()