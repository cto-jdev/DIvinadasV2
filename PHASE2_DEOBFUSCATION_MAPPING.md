# FASE 2 - DEOBFUSCACIÓN Y ANÁLISIS DE CÓDIGO
## Mapa de Renombramiento de Variables

**Estado**: Análisis Completo
**Archivos**: libs1.js, libs2.js, libs3.js, libs4.js, libs5_clean.js (11,057 líneas)
**Patrón Identificado**: Ofuscación sistemática con variables p*, v*, vLS, vLN

---

## PATRONES IDENTIFICADOS

### Patrón 1: Variables de Parámetro Numérico (p*)
```javascript
// Patrón: function name(p5) { return new Promise((p8, p9) => { ... }) }
// Significado: p5 = parámetro, p8 = resolve, p9 = reject

p5 → delayTime (milisegundos)
p6, p7 → resolve/reject de Promise
p8, p9 → resolve/reject de Promise (checkLive)
p10, p11, p12, p13, p14 → filter callbacks, valores extraídos
p15, p16 → resolve/reject (getAccessToken)
p17, p18 → resolve/reject (getFBDTSG)
p19, p20 → resolve/reject (getUserInfo)
p21 → filter callback (map/filter)
p23, p24 → resolve/reject (getBMList)
p31, p32 → resolve/reject (getMainBm)
p33, p34 → resolve/reject (getMainBmAccounts)
p35, p36 → resolve/reject
p40, p41 → resolve/reject (getAccountsWithPM)
p42 → map callback (account nodes)
p43, p44 → resolve/reject
p45 → parámetro capturado
p47, p48 → resolve/reject
p50, p51 → resolve/reject
```

### Patrón 2: Variables Locales Numéricas (v*)
```javascript
v12 → respuesta de fetch
v13 → resultado de getCookie()
v14, v15, v16 → parsed response, match result, token encontrado
v19 → respuesta de fetch
v20, v21 → accessToken, token extraídos
v32 → userInfo parsed
v35, v36 → array de datos, filtered result
v57, v58, v59, v63 → respuestas de API, parsed data
```

### Patrón 3: Variables Especiales
```javascript
vLS → localStorage (LS = Local Storage)
vLN02, vLN03 → numéricos locales (LN = Local Numeric)
vO6, vO8, vO15 → opciones/configuración (O = Options)
```

---

## MAPEO RECOMENDADO POR FUNCIÓN

### En `libs1.js` (FB class)

#### `delayTime(p5)`
```javascript
ANTES: function delayTime(p5)
DESPUÉS: function delayTime(milliseconds)
PARÁMETRO: p5 → milliseconds
```

#### `checkLive()`
```javascript
ANTES:
  return new Promise(async (p8, p9) => {
    const v12 = await fetch2(...)
    const v13 = await getCookie()
    let vLN02 = 0
    let vLN03 = 0

DESPUÉS:
  return new Promise(async (resolve, reject) => {
    const response = await fetch2(...)
    const cookieData = await getCookie()
    let currentUserId = 0
    let storedUserId = 0
```

#### `getAccessToken()`
```javascript
ANTES:
  return new Promise(async (p11, p12) => {
    const v19 = await fetch2(...)
    const v20 = v19.match(...).filter(p13 => ...)
    const v21 = v19.match(...).filter(p14 => ...)

DESPUÉS:
  return new Promise(async (resolve, reject) => {
    const responseText = await fetch2(...)
    const accessTokens = responseText.match(...).filter(token => ...)
    const tokens = responseText.match(...).filter(token => ...)
```

#### `getFBDTSG()`
```javascript
ANTES:
  return new Promise(async (p15, p16) => {

DESPUÉS:
  return new Promise(async (resolve, reject) => {
```

#### `getUserInfo()`
```javascript
ANTES:
  return new Promise(async (p17, p18) => {

DESPUÉS:
  return new Promise(async (resolve, reject) => {
```

---

## SCRIPT DE REFACTORIZACIÓN (Fase 2)

### Paso 1: Crear Mapa Global de Reemplazos

```javascript
// REPLACEMENT_MAP.json
{
  "promises": {
    "p8": "resolve",
    "p9": "reject",
    "p11": "resolve",
    "p12": "reject",
    "p15": "resolve",
    "p16": "reject",
    "p17": "resolve",
    "p18": "reject"
  },
  "responses": {
    "v12": "response",
    "v13": "cookieData",
    "v14": "parsedResponse",
    "v15": "responseText",
    "v16": "extractedToken"
  },
  "tokens": {
    "v20": "accessTokens",
    "v21": "facebookTokens"
  },
  "data": {
    "v32": "userInfoData",
    "v35": "accountsArray",
    "v36": "filteredAccounts"
  },
  "special": {
    "vLS": "localStorageValue",
    "vLN02": "currentUserId",
    "vLN03": "storedUserId"
  }
}
```

### Paso 2: Refactorización Secuencial

```bash
# Para cada archivo (libs1.js → libs5.js)
1. Crear copia de seguridad
2. Aplicar reemplazos contextuales
3. Verificar sintaxis
4. Probar funcionalidad
5. Commit incremental
```

---

## ANÁLISIS DE DUPLICACIÓN

### Funciones Encontradas en Múltiples Archivos

1. **`getCurrentUser()`**
   - Ubicación: libs1.js, libs4.js
   - Líneas: ~50 líneas cada una
   - Acción: CONSOLIDAR en utils/user.js

2. **`getLocalStorage()` / `setLocalStorage()`**
   - Ubicación: Múltiples archivos
   - Propósito: Wrapper de localStorage
   - Acción: MIGRAR a modules/storage.js

3. **`getBase64ImageFromUrl()`**
   - Ubicación: libs1.js, libs2.js, libs3.js
   - Tamaño: ~30 líneas cada una
   - Acción: CONSOLIDAR en utils/image.js

4. **`fetch2()` wrapper**
   - Ubicación: libs1.js, libs4.js
   - Propósito: Wrapper de fetch con extensión
   - Acción: MIGRAR a modules/api.js (ya existe)

---

## PLAN DE CONSOLIDACIÓN

### Nuevo Directorio: `/js/utils/`

```
/js/utils/
├── user.js              (50 KB) - getCurrentUser, userInfo management
├── storage.js           (15 KB) - getLocalStorage, setLocalStorage
├── image.js             (20 KB) - getBase64ImageFromUrl, image utils
├── facebook-api.js      (30 KB) - Facebook Graph API helpers
├── parsing.js           (25 KB) - HTML/JSON parsing utilities
└── helpers.js           (40 KB) - Misc helpers (cookie parsing, etc.)
```

### Reducción de Tamaño Esperada

```
ANTES:
  libs1.js  139 KB
  libs2.js   96 KB
  libs3.js   86 KB
  libs4.js  149 KB
  libs5.js   91 KB
  TOTAL    561 KB

DESPUÉS (con consolidación):
  libs1.js  120 KB (reducido)
  libs2.js   75 KB (reducido)
  libs3.js   65 KB (reducido)
  libs4.js  130 KB (reducido)
  libs5.js   70 KB (reducido)
  utils/*.js 150 KB (consolidado)
  TOTAL    610 KB → 380 KB META (-230 KB)
```

---

## EJECUCIÓN RECOMENDADA

### FASE 2.1: Análisis y Mapeo (1 día)
- ✓ Crear mapa completo de variables (YA HECHO)
- [ ] Identificar contexto de cada variable
- [ ] Crear diccionario de renombramiento

### FASE 2.2: Refactorización Incremental (2-3 días)
- [ ] Refactorizar libs1.js (función por función)
- [ ] Refactorizar libs2.js
- [ ] Refactorizar libs3.js
- [ ] Refactorizar libs4.js
- [ ] Refactorizar libs5.js

### FASE 2.3: Consolidación (1-2 días)
- [ ] Crear módulo utils/user.js
- [ ] Crear módulo utils/storage.js
- [ ] Crear módulo utils/image.js
- [ ] Actualizar imports en todos los archivos

### FASE 2.4: Testing y Validación (1 día)
- [ ] Pruebas funcionales de cada módulo
- [ ] Verificar no hay duplicación
- [ ] Performance check (bundle size)

---

## HERRAMIENTAS RECOMENDADAS

### Para Desobfuscación
```bash
# 1. IDE con refactoring (VS Code, WebStorm)
#    - Rename Symbol (F2) para reemplazos seguros
#    - Find & Replace con regex

# 2. ESLint + Prettier
#    - Verificar sintaxis después de cambios
#    - Formatear consistentemente

# 3. Git
#    - Commit después de cada función refactorizada
#    - Fácil revertir si algo sale mal
```

---

## VARIABLES A RENOMBRAR (TOTAL: ~200+)

### Promise Callbacks (~80)
```
p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20,
p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35,
p36, p37, p38, p39, p40, p41, p42, p43, p44, p45, p46, p47, p48, p49, p50
→ resolve/reject/callbacks/parameters (contexto-específico)
```

### Local Variables (~120)
```
v12, v13, v14, v15, v16, v17, v18, v19, v20, v21, v22, v23, v24, v25, v26,
v27, v28, v29, v30, v31, v32, v33, v34, v35, v36, v37, v38, v39, v40, v41,
v42, v43, v44, v45, v46, v47, v48, v49, v50, v51, v52, v53, v54, v55, v56,
v57, v58, v59, v60, v61, v62, v63, v64, v65, v66, v67, v68, v69, v70, v71,
v72, v73, v74, v75, v76, v77, v78, v79, v80, v81, v82, v83, v84, v85, v86,
v87, v88, v89, v90, v91, v92, v93, v94, v95, v96, v97, v98, v99
→ response/data/result/parsed/extracted/... (contexto-específico)
```

### Special Variables (~20)
```
vLS, vLN02, vLN03, vLN04, ..., vO6, vO8, vO15, ...
→ localStorageValue, currentUserId, storedUserId, ..., options, ...
```

---

## PRIORIDADES

### ALTA (Impacto en Mantenibilidad)
1. `FB.checkLive()` - Función crítica
2. `FB.getAccessToken()` - Token management
3. `FB.getUserInfo()` - User data
4. `getLocalStorage()` / `setLocalStorage()` - Usados everywhere

### MEDIA (Impacto Moderado)
5. `getBase64ImageFromUrl()` - Image processing
6. Funciones de parsing (HTML, JSON)
7. Funciones helper de Facebook

### BAJA (Util pero no crítico)
8. Funciones auxiliares
9. Constantes
10. Callbacks simples

---

## PRÓXIMOS PASOS

```
1. ✅ COMPLETADO: Análisis de variables
2. 📋 PENDIENTE: Validar mapa con usuario
3. ⏳ FASE 2.1: Crear diccionario definitivo
4. ⏳ FASE 2.2: Refactorizar función por función
5. ⏳ FASE 2.3: Consolidar en modules
6. ⏳ FASE 2.4: Testing y validación
```

**Siguiente paso**: ¿Proceder con refactorización de `libs1.js`?

---

**Auditor**: Full Stack Developer - QA Specialist
**Fase**: 2 de 5 - Análisis Completo ✅
**Líneas a Refactorizar**: 11,057
**Variables a Renombrar**: 200+
