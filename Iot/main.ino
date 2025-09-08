#include <WiFi.h>
#include <PubSubClient.h>
#include "time.h"

// WiFi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// MQTT Broker
const char* mqtt_server = "TU_IP_BROKER";
WiFiClient espClient;
PubSubClient client(espClient);

// Sensor y productos
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int DIST_THRESHOLD_CM = 10;

struct Producto { int id; const char* nombre; const char* marca; float precio; };
Producto productos[] = {
  {1, "Perfume Temptation", "BrandA", 35.00},
  {2, "Crema Facial", "BrandB", 20.00},
  {3, "Perfume Noir", "BrandC", 42.50}
};

int idx = 0;
int registroID = 1;

const long gmtOffset_sec = -5*3600;
const int daylightOffset_sec = 0;
const char* ntpServer = "pool.ntp.org";

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) delay(500);

  client.setServer(mqtt_server,1883);
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

void reconnect() {
  while(!client.connected()) {
    if(client.connect("ESP32_Client")) Serial.println("MQTT Conectado");
    else delay(2000);
  }
}

void loop() {
  if(!client.connected()) reconnect();
  client.loop();

  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long dur = pulseIn(ECHO_PIN,HIGH,30000);
  float dist = (dur==0)?999.0:(dur*0.034/2.0);

  if(dist>0 && dist<DIST_THRESHOLD_CM){
    enviarProductoMQTT(productos[idx]);
    idx = (idx+1) % (sizeof(productos)/sizeof(productos[0]));
    delay(15000);
  }
  delay(200);
}

void enviarProductoMQTT(const Producto &p){
  struct tm t;
  char fh[25]="";
  if(getLocalTime(&t)) strftime(fh,sizeof(fh),"%Y-%m-%d %H:%M:%S",&t);
  else snprintf(fh,sizeof(fh),"ts:%lu",millis());

  int idRegistro = registroID++;
  String payload = "{";
  payload += "\"idRegistro\":"+String(idRegistro)+",";
  payload += "\"idProducto\":"+String(p.id)+",";
  payload += "\"nombre\":\""+String(p.nombre)+"\",";
  payload += "\"marca\":\""+String(p.marca)+"\",";
  payload += "\"precio\":"+String(p.precio,2)+",";
  payload += "\"fechaHora\":\""+String(fh)+"\"}";

  client.publish("tiendas/tu_r_l/productos", payload.c_str());
  Serial.println("Producto enviado via MQTT: "+payload);
}
