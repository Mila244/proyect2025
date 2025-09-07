import React, { useEffect, useRef, useState } from "react";

export default function CameraScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (e) {
        console.error("No se pudo abrir la cámara:", e);
      }
    })();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);

    c.toBlob(
      async (blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

        // 🔹 Enviar al backend
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          setResult(data);
        } catch (err) {
          console.error("Error al reconocer producto:", err);
          setResult({ error: "No se pudo reconocer el producto" });
        } finally {
          setLoading(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">Reconocimiento con cámara</h3>
      <div className="relative w-72 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-indigo-500">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!ready && (
            <p className="text-white text-lg animate-pulse">Cargando cámara...</p>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={capture}
        disabled={!ready || loading}
        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
      >
        📸 {loading ? "Analizando..." : "Capturar"}
      </button>

      {/* Resultado */}
      {result && !loading && (
        <div className="mt-6 bg-gray-700 p-4 rounded-lg shadow-md w-80 text-center">
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">{result.name}</h2>
              <p className="text-gray-300">Marca: {result.brand}</p>
              <p className="text-green-400 font-semibold">S/ {result.price}</p>
              <p className="text-gray-400 mt-2">{result.description}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
