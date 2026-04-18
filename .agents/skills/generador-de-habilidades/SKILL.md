---
name: generador-de-habilidades
description: Utilidad para crear nuevas habilidades (skills) en español. El agente debe usar esta habilidad cuando el usuario solicite una nueva capacidad, función o 'skill' para el workspace.
---

# Generador de Habilidades (Skills)

Esta habilidad permite al agente crear nuevas habilidades estructuradas en el workspace, siguiendo las mejores prácticas de Google Antigravity.

## Cuándo usar esta habilidad
Usa esta habilidad cuando el usuario pida:
- "Crea una habilidad para..."
- "Enséñame a hacer X en este workspace permanentemente"
- "Agrega una nueva capacidad de..."
- "Genera un skill en español para..."

## Estructura de una Habilidad
Toda habilidad debe residir en:
`d:/OneDrive/AAA-Carpeta Trabajo 2026/1-Carperta Trabajo Colombia Principal 2026/VUM Tech/Ruta Facil - Licencia Agil/Caja Oscar/crc-caja-saas/.agents/skills/<nombre-de-la-habilidad>/`

Cada carpeta de habilidad DEBE contener al menos un archivo `SKILL.md`.

## Instrucciones para crear una nueva habilidad

1.  **Entender el Requisito**: Analiza qué tarea específica quiere automatizar o mejorar el usuario.
2.  **Definir el Nombre**: Usa un nombre descriptivo en minúsculas y separado por guiones (kebab-case).
3.  **Crear el Directorio**: Crea la carpeta en `.agents/skills/<nombre-de-la-habilidad>/`.
4.  **Escribir el Frontmatter**:
    ```yaml
    ---
    name: <nombre-de-la-habilidad>
    description: <Descripción clara y concisa en español sobre cuándo activar esta habilidad>
    ---
    ```
5.  **Redactar las Instrucciones**: En el cuerpo de `SKILL.md`, incluye:
    - `# Título de la Habilidad`
    - `## Objetivo`: Qué logra esta habilidad.
    - `## Guía de Uso`: Pasos detallados para el agente.
    - `## Ejemplos`: (Opcional) Casos de uso comunes.
6.  **Verificar**: Confirma al usuario que la habilidad ha sido creada y está lista para ser descubierta en la siguiente interacción.

## Ejemplo de Habilidad (SKILL.md)
```markdown
---
name: redactor-correos
description: Ayuda a redactar correos electrónicos formales e informales en español siguiendo tonos específicos.
---

# Redactor de Correos

## Objetivo
Asistir en la creación de correos electrónicos profesionales.

## Instrucciones
1. Preguntar el tono (formal/informal).
2. Solicitar los puntos clave del mensaje.
3. Generar 2 opciones de borrador.
```
