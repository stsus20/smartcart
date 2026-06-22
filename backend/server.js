const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const ARCHIVO_LISTA = "./lista.json";
const ARCHIVO_HISTORIAL = "./historial.json";

// =========================
// UTILIDADES
// =========================

function leerJSON(ruta) {
  try {
    if (!fs.existsSync(ruta)) {
      fs.writeFileSync(ruta, JSON.stringify([], null, 2));
      return [];
    }

    const contenido = fs.readFileSync(ruta, "utf8");

    if (!contenido.trim()) {
      return [];
    }

    return JSON.parse(contenido);
  } catch (error) {
    console.error(`❌ Error leyendo ${ruta}:`, error);
    return [];
  }
}

function escribirJSON(ruta, data) {
  try {
    fs.writeFileSync(
      ruta,
      JSON.stringify(data, null, 2)
    );
    return true;
  } catch (error) {
    console.error(`❌ Error escribiendo ${ruta}:`, error);
    return false;
  }
}

// Crear archivos si no existen
if (!fs.existsSync(ARCHIVO_LISTA)) {
  escribirJSON(ARCHIVO_LISTA, []);
}

if (!fs.existsSync(ARCHIVO_HISTORIAL)) {
  escribirJSON(ARCHIVO_HISTORIAL, []);
}

// =========================
// LISTA
// =========================

app.get("/api/lista", (req, res) => {
  const lista = leerJSON(ARCHIVO_LISTA);

  console.log(
    `📥 GET /api/lista (${lista.length} productos)`
  );

  res.json(lista);
});

app.post("/api/lista", (req, res) => {
  console.log("📥 POST /api/lista");
  console.log(req.body);

  const { productos } = req.body;

  if (!Array.isArray(productos)) {
    return res.status(400).json({
      ok: false,
      error: "Se esperaba un arreglo productos",
    });
  }

  const guardado = escribirJSON(
    ARCHIVO_LISTA,
    productos
  );

  if (!guardado) {
    return res.status(500).json({
      ok: false,
      error: "No se pudo guardar la lista",
    });
  }

  console.log(
    `📝 Lista actualizada (${productos.length} productos)`
  );

  res.json({
    ok: true,
    total: productos.length,
  });
});

// =========================
// RESULTADO
// =========================

app.get("/api/resultado", (req, res) => {
  const productos = leerJSON(ARCHIVO_LISTA);

  const comprados = productos.filter(
    p => p.comprado
  );

  const pendientes = productos.filter(
    p => !p.comprado
  );

  const total = productos.length;

  const porcentaje =
    total === 0
      ? 0
      : Math.round(
          (comprados.length / total) * 100
        );

  res.json({
    total,
    comprados,
    pendientes,
    porcentaje,
  });
});

// =========================
// HISTORIAL
// =========================

app.get("/api/historial", (req, res) => {
  const historial = leerJSON(
    ARCHIVO_HISTORIAL
  );

  console.log(
    `📜 GET /api/historial (${historial.length} registros)`
  );

  res.json(historial);
});

app.post("/api/historial", (req, res) => {
  console.log("📥 POST /api/historial");
  console.log(req.body);

  const {
    fecha,
    hora,
    productos,
    total,
    comprados,
    porcentaje,
  } = req.body;

  if (!Array.isArray(productos)) {
    return res.status(400).json({
      ok: false,
      error: "Se esperaba un arreglo productos",
    });
  }

  const historial = leerJSON(
    ARCHIVO_HISTORIAL
  );

  const nuevaEntrada = {
    id: Date.now(),
    fecha,
    hora,
    productos,
    total,
    comprados,
    porcentaje,
  };

  historial.push(nuevaEntrada);

  const guardado = escribirJSON(
    ARCHIVO_HISTORIAL,
    historial
  );

  if (!guardado) {
    return res.status(500).json({
      ok: false,
      error: "No se pudo guardar el historial",
    });
  }

  console.log(
    `✅ Historial guardado (${historial.length} registros)`
  );

  res.json({
    ok: true,
    entrada: nuevaEntrada,
  });
});

app.delete("/api/historial", (req, res) => {
  const guardado = escribirJSON(
    ARCHIVO_HISTORIAL,
    []
  );

  if (!guardado) {
    return res.status(500).json({
      ok: false,
      error: "No se pudo borrar el historial",
    });
  }

  console.log("🗑️ Historial eliminado");

  res.json({
    ok: true,
  });
});

// =========================
// TEST
// =========================

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

// =========================
// INICIAR SERVIDOR
// =========================

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("🚀 SERVIDOR INICIADO");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("");
});