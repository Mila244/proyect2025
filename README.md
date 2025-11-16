# Proyecto 2025 - Plataforma IoT y Cámara Scanner

## Descripción
Proyecto 2025 es una plataforma web para la gestión de productos y dispositivos IoT. Permite:

- Visualizar productos con estilo moderno y animaciones CSS.
- Monitorear estadísticas mediante gráficos interactivos.
- Escanear productos usando la cámara del dispositivo.
- Exportar datos a Excel de forma sencilla.
- Organizar productos por día, marca y otras categorías.

El objetivo es combinar **IoT**, **visualización de datos** y **reconocimiento por cámara** en una sola aplicación.

---

## Tecnologías Utilizadas

- **Frontend:** React, Tailwind CSS / CSS personalizado, Recharts.
- **Backend:** Node.js / Express (o Flask según implementación).
- **IoT:** MQTT para comunicación con dispositivos.
- **Extras:** Exportación de datos tipo Excel, WebCam API para cámara.

---

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/Mila244/proyect2025.git
cd proyect2025
```bash
2. Instalar dependencias del frontend:
cd frontend
npm install
```bash
3. Instalar dependencias del backend:
cd ../backend
npm install
```bash
4. Ejecutar el proyecto:
# Frontend
cd ../frontend
npm start

# Backend
cd ../backend
npm start

Uso

Abre la aplicación en http://localhost:3000.

Explora el dashboard de productos con gráficos y animaciones.

Escanea productos con la cámara desde la sección de "Reconocimiento con cámara".

Filtra productos por marca, día u otras categorías.

Exporta los datos usando el botón Exportar a Excel.