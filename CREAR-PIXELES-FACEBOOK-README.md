# 🎯 Crear Píxeles de Facebook - DivinAds

## 📋 Nueva Funcionalidad Implementada

Se ha agregado la capacidad de **crear píxeles de Facebook** directamente desde la sección BM usando la **Facebook Marketing API v22.0**.

---

## 🚀 **Cómo Usar la Funcionalidad**

### 1. **Acceder a la función**
- Abre `bm.html` en tu navegador
- Ve al panel lateral derecho
- Busca la tarjeta **"Crear Píxel de Facebook"** con el ícono de radar 📡

### 2. **Seleccionar cuentas**
- En la tabla principal, **selecciona las cuentas publicitarias** para las que quieres crear píxeles
- Puedes seleccionar una o múltiples cuentas

### 3. **Configurar el píxel**
- **Activa** el interruptor "Crear Píxel de Facebook"
- **Nombre del píxel**: Ingresa un nombre descriptivo (máx. 50 caracteres)
- **Configuración avanzada**:
  - ✅ **Coincidencia automática avanzada**: Mejora el matching de usuarios
  - ✅ **Cookies de primera parte**: Mejora el tracking en iOS 14.5+

### 4. **Ejecutar la creación**
- Haz clic en el botón **"Iniciar"**
- El sistema procesará cada cuenta seleccionada
- Verás el progreso en tiempo real

---

## 📊 **Información Técnica**

### **Endpoint de API Utilizado:**
```
POST https://graph.facebook.com/v22.0/act_{AD_ACCOUNT_ID}/adspixels
```

### **Parámetros Enviados:**
- `name`: Nombre del píxel
- `enable_automatic_matching`: true/false
- `automatic_matching_fields`: ['em', 'fn', 'ln', 'ph', 'ge', 'zp', 'ct', 'st', 'country']
- `first_party_cookie_status`: 'FIRST_PARTY_COOKIE_ENABLED'
- `access_token`: Token de acceso de Facebook

### **Formatos de ID Soportados:**
- `act_123456789` (formato completo)
- `123456789` (se añade 'act_' automáticamente)

---

## ✅ **Características Implementadas**

### **🎯 Funcionalidades Principales:**
1. **Creación masiva**: Procesa múltiples cuentas en una sola ejecución
2. **Nombres únicos**: Añade ID de cuenta automáticamente para múltiples píxeles
3. **Progreso en tiempo real**: Muestra el estado de cada creación
4. **Manejo de errores**: Captura y reporta errores específicos
5. **Rate limiting**: Delay automático entre requests (1 segundo)

### **📈 Monitoreo y Resultados:**
- **Progreso en vivo**: Ve cada píxel siendo creado
- **Contadores**: Éxitos vs errores en tiempo real
- **Resultados detallados**: Lista completa de píxeles creados y errores
- **Resumen final**: Popup con estadísticas finales

### **🛡️ Validaciones:**
- Verificación de cuentas seleccionadas
- Validación de nombre del píxel
- Límite de caracteres en nombre
- Manejo de respuestas de API

---

## 🎨 **Interfaz de Usuario**

### **Panel de Configuración:**
```
┌─────────────────────────────────────┐
│ 📡 Crear Píxel de Facebook         │
├─────────────────────────────────────┤
│ ℹ️ Información: Se creará un píxel  │
│   para las cuentas seleccionadas    │
│                                     │
│ Nombre del píxel:                   │
│ [Mi Píxel DivinAds 2024________]    │
│                                     │
│ Configuración avanzada:             │
│ ☑️ Coincidencia automática avanzada │
│ ☑️ Cookies de primera parte         │
└─────────────────────────────────────┘
```

### **Panel de Progreso:**
```
┌─────────────────────────────────────┐
│ Progreso de Creación de Píxeles     │
├─────────────────────────────────────┤
│ 14:30:15 [1/3] Creando píxel...    │
│ 14:30:16 ✅ Píxel creado: Mi Píxel │
│ 14:30:17 [2/3] Creando píxel...    │
│ 14:30:18 ❌ Error en cuenta 456... │
└─────────────────────────────────────┘
```

### **Resultados Finales:**
```
┌──────────────────┬──────────────────┐
│ ✅ Exitosos: 2   │ ❌ Errores: 1    │
├──────────────────┼──────────────────┤
│ Mi Píxel - 123   │ Error en 456:    │
│ (ID: 789012...)  │ Token inválido   │
│ Mi Píxel - 321   │                  │
│ (ID: 345678...)  │                  │
└──────────────────┴──────────────────┘
```

---

## 🔧 **Troubleshooting**

### **Errores Comunes:**

#### **1. "Token inválido"**
- **Causa**: Access token expirado o sin permisos
- **Solución**: Renovar token de Facebook con permisos de `ads_management`

#### **2. "Permissions error"**
- **Causa**: Sin permisos para crear píxeles en la cuenta
- **Solución**: Verificar que tienes rol de Admin en la cuenta publicitaria

#### **3. "A pixel already exists for this account"**
- **Causa**: Ya existe un píxel para esa cuenta
- **Solución**: Usar el píxel existente o eliminar el anterior

#### **4. "Invalid parameter"**
- **Causa**: Formato incorrecto de ID de cuenta
- **Solución**: Verificar que el ID sea válido (formato `act_XXXXXXXXX`)

### **Verificaciones Pre-Creación:**
1. ✅ Token de Facebook válido y con permisos
2. ✅ Cuentas publicitarias seleccionadas correctamente
3. ✅ Nombre del píxel sin caracteres especiales
4. ✅ Conexión a internet estable

---

## 📱 **Compatibilidad**

### **APIs Soportadas:**
- ✅ Facebook Marketing API v22.0
- ✅ Retrocompatible con v21.0+

### **Navegadores:**
- ✅ Chrome 90+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 90+

### **Características iOS 14.5+:**
- ✅ Configuración automática para Aggregated Event Measurement
- ✅ Cookies de primera parte habilitadas por defecto
- ✅ Coincidencia automática optimizada

---

## 🎯 **Casos de Uso**

### **1. Setup Inicial de Campaña:**
```
1. Seleccionar cuenta publicitaria nueva
2. Crear píxel: "Píxel Campaña Navidad 2024"
3. Configurar coincidencia automática
4. Implementar código en sitio web
```

### **2. Migración Masiva:**
```
1. Seleccionar múltiples cuentas antigas
2. Crear píxeles: "Píxel Migración Q1 2024"
3. Verificar creación exitosa
4. Actualizar tracking en websites
```

### **3. Testing A/B:**
```
1. Crear píxel de testing: "Test Píxel V2"
2. Comparar con píxel original
3. Analizar performance
4. Decidir cuál mantener
```

---

## 🔮 **Futuras Mejoras**

### **Próximas Funcionalidades:**
- [ ] **Verificación previa**: Comprobar píxeles existentes antes de crear
- [ ] **Templates de nombres**: Plantillas predefinidas para nombres
- [ ] **Batch processing**: Procesamiento en lotes más grandes
- [ ] **Integración con Conversions API**: Setup automático de server events
- [ ] **Backup automático**: Exportar configuraciones de píxeles

### **Mejoras de UX:**
- [ ] **Preview del código**: Mostrar código del píxel antes de implementar
- [ ] **Validación en tiempo real**: Verificar cuentas antes de procesar
- [ ] **Historial**: Log de píxeles creados anteriormente
- [ ] **Import/Export**: Importar configuraciones desde archivo

---

## 📞 **Soporte**

Si encuentras algún problema con la funcionalidad de crear píxeles:

1. **Revisa la consola del navegador** (F12) para errores detallados
2. **Verifica los permisos** de tu token de Facebook
3. **Comprueba el formato** de los IDs de cuenta
4. **Consulta la documentación** de Facebook Marketing API

### **Enlaces Útiles:**
- [Facebook Marketing API Reference](https://developers.facebook.com/docs/marketing-api/reference/ads-pixel/)
- [Pixel Setup Guide](https://developers.facebook.com/docs/meta-pixel/get-started/)
- [iOS 14.5 Changes](https://developers.facebook.com/docs/ios/tracking/)

---

## 🎉 **¡Funcionalidad Lista para Usar!**

La funcionalidad de **crear píxeles de Facebook** está completamente implementada y lista para usar en tu instancia de DivinAds. ¡Disfruta de la automatización de este proceso que antes requería hacerse manualmente! 🚀 