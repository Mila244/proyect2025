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
    <div className="scanner-container">

      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
        />
        {!ready && <p className="loading-text">Cargando cámara...</p>}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button className="capture-btn" onClick={capture} disabled={!ready || loading}>
        {loading ? "Analizando..." : "Capturar"}
      </button>

      {result && !loading && (
        <div className="result-card">
          {result.error ? (
            <p className="error-text">{result.error}</p>
          ) : (
            <>
              <h2>{result.name}</h2>
              <p><strong>Marca:</strong> {result.brand}</p>
              <p><strong>Precio:</strong> {result.price}</p>
              <p>{result.description}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
