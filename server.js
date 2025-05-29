const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rutas específicas para cada página
app.get('/bm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'bm.html'));
});

app.get('/ads.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'ads.html'));
});

app.get('/page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page.html'));
});

app.get('/setting.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'setting.html'));
});

app.get('/phoi.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'phoi.html'));
});

// API para verificar el estado del servidor
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        message: 'DivinAds Dashboard Server está funcionando correctamente',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// API para plantillas (si es necesario)
app.get('/api/templates', (req, res) => {
    try {
        // Aquí puedes agregar lógica para obtener plantillas
        res.json({
            success: true,
            templates: [],
            message: 'Templates endpoint disponible'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
🚀 ===================================
   SERVIDOR DIVINADS INICIADO
===================================
📍 URL Principal: http://localhost:${PORT}
📋 Business Manager: http://localhost:${PORT}/bm.html
📊 Anuncios: http://localhost:${PORT}/ads.html
📄 Páginas: http://localhost:${PORT}/page.html
⚙️ Configuración: http://localhost:${PORT}/setting.html
🖼️ Editor de Plantillas: http://localhost:${PORT}/phoi.html
📊 Estado del Sistema: http://localhost:${PORT}/api/status
🔧 API de Plantillas: http://localhost:${PORT}/api/templates
✨ Características disponibles:
   • Servidor de archivos estáticos
   • CORS habilitado
   • API REST básica
   • Compatibilidad completa con DivinAds
===================================
    `);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    process.exit(1);
}); 