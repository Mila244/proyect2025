import { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function IoTProducts() {
  const [productos, setProductos] = useState([]);
  const [openDay, setOpenDay] = useState(null);
  const [filterBrand, setFilterBrand] = useState("Todas");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Filtrar productos por marca y rango de fechas
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const fecha = new Date(p.fechaHora);
      const desde = dateRange.from ? new Date(dateRange.from) : null;
      const hasta = dateRange.to ? new Date(dateRange.to) : null;
      const marcaOk = filterBrand === "Todas" || p.brand === filterBrand;
      const fechaOk =
        (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
      return marcaOk && fechaOk;
    });
  }, [productos, filterBrand, dateRange]);

  // Agrupar productos por día
  const productosPorDia = useMemo(() => {
    return productosFiltrados.reduce((acc, p) => {
      const day = new Date(p.fechaHora).toISOString().split("T")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(p);
      return acc;
    }, {});
  }, [productosFiltrados]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get("/api/productos");
        setProductos(res.data);
      } catch (error) {
        console.error("Error al obtener productos IoT:", error);
      }
    };

    fetchProductos();
    const interval = setInterval(fetchProductos, 5000); // cada 5s
    return () => clearInterval(interval);
  }, []);

  // Exportar Excel con XLSX
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(productosFiltrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos IoT");
    XLSX.writeFile(workbook, "Productos_IoT.xlsx");
  };

  // Generar lista de marcas únicas para el filtro
  const marcas = useMemo(() => {
    const setMarcas = new Set(productos.map((p) => p.brand));
    return ["Todas", ...Array.from(setMarcas)];
  }, [productos]);

  // Datos para gráfico por día
  const chartData = useMemo(() => {
    return Object.keys(productosPorDia).map((day) => ({
      day,
      total: productosPorDia[day].length,
    }));
  }, [productosPorDia]);

  return (
    <div className="iot-container">
      <div className="iot-header">
        <h1>📡 Productos Detectados (IoT)</h1>
        <p>Actualización automática cada <span>5 segundos</span></p>
      </div>

      {/* ====== FILTROS ====== */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          style={{ padding: "10px 15px", borderRadius: "10px", fontSize: "1rem" }}
        >
          {marcas.map((m, i) => <option key={i} value={m}>{m}</option>)}
        </select>

        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
        />
      </div>

      {/* ====== GRÁFICO ====== */}
      {chartData.length > 0 && (
        <div style={{ width: "100%", height: "250px", marginBottom: "30px" }}>
          <ResponsiveContainer>
            <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip content={false} />  {/* Tooltip desactivado */}
              <Bar dataKey="total" fill="#4a90e2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}


      {/* ====== LISTADO POR DÍA (ACORDEÓN) ====== */}
      {Object.keys(productosPorDia).length === 0 ? (
        <p style={{ textAlign: "center" }}>No hay productos detectados aún.</p>
      ) : (
        Object.keys(productosPorDia).map((day) => (
          <div key={day} className="day-group">
            <h2
              className="day-title"
              onClick={() => setOpenDay(openDay === day ? null : day)}
              style={{ cursor: "pointer" }}
            >
              📅 {day} {openDay === day ? "▲" : "▼"}
            </h2>

            <div
              className="day-content"
              style={{
                maxHeight: openDay === day ? "1000px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.5s ease",
              }}
            >
              <div className="table-wrapper">
                <table className="iot-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID Registro</th>
                      <th>ID Producto</th>
                      <th>Nombre</th>
                      <th>Marca</th>
                      <th>Precio</th>
                      <th>Fecha / Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosPorDia[day].map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{p.idRegistro}</td>
                        <td>{p.idProducto}</td>
                        <td>{p.name}</td>
                        <td>{p.brand}</td>
                        <td>S/.{p.price}</td>
                        <td>{p.fechaHora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {/* ====== BOTÓN EXPORTAR ====== */}
      <div className="iot-footer">
        <button className="iot-export-btn" onClick={exportExcel}>
          📤 Exportar Excel
        </button>
      </div>
    </div>
  );
}
