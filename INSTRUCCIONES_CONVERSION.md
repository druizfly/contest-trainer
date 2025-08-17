# 📋 Instrucciones para Convertir CSV a JSON

Este documento explica cómo convertir tu archivo `preguntas.csv` a `preguntas.json` para que la aplicación Concurso Trainer pueda leer las preguntas correctamente.

## 🎯 **Objetivo**

Convertir el archivo CSV con preguntas de conocimiento general a un formato JSON estructurado que la aplicación pueda procesar.

## 📁 **Archivos de Conversión Disponibles**

### **1. Python (Recomendado)**
- **Archivo:** `convert_csv_to_json.py`
- **Requisitos:** Python 3.6+
- **Uso:** `python3 convert_csv_to_json.py`

### **2. Node.js**
- **Archivo:** `convert_csv_to_json.js`
- **Requisitos:** Node.js 12+
- **Uso:** `node convert_csv_to_json.js`

### **3. Bash (Automático)**
- **Archivo:** `convert_csv_to_json.sh`
- **Requisitos:** Bash + Python/Node.js
- **Uso:** `./convert_csv_to_json.sh`

## 🚀 **Pasos para Convertir**

### **Opción 1: Python (Más Robusto)**

```bash
# 1. Verificar que tienes Python instalado
python3 --version

# 2. Ejecutar el script
python3 convert_csv_to_json.py

# 3. Verificar que se generó el archivo
ls -la data/preguntas.json
```

### **Opción 2: Node.js**

```bash
# 1. Verificar que tienes Node.js instalado
node --version

# 2. Ejecutar el script
node convert_csv_to_json.js

# 3. Verificar que se generó el archivo
ls -la data/preguntas.json
```

### **Opción 3: Bash (Automático)**

```bash
# 1. Dar permisos de ejecución
chmod +x convert_csv_to_json.sh

# 2. Ejecutar el script
./convert_csv_to_json.sh

# 3. Verificar que se generó el archivo
ls -la data/preguntas.json
```

## 📊 **Formato del CSV Esperado**

Tu archivo `preguntas.csv` debe tener esta estructura:

```csv
Categoria,Pregunta,Respuesta Correcta,Respuesta Incorrecta 1,Respuesta Incorrecta 2,Respuesta Incorrecta 3
Historia,¿En qué año terminó la Segunda Guerra Mundial?,1945,1944,1939,1950
Geografía,¿Cuál es la capital de Francia?,París,Berlín,Londres,Roma
```

## 🎨 **Formato JSON Generado**

El script generará un archivo `data/preguntas.json` con esta estructura:

```json
{
  "categorias": ["Arte", "Cine y Series", "Deportes", "Geografía", "Historia", "Literatura", "Ciencia y Naturaleza"],
  "preguntas": [
    {
      "categoria": "Historia",
      "pregunta": "¿En qué año terminó la Segunda Guerra Mundial?",
      "respuesta_correcta": "1945",
      "respuestas_incorrectas": ["1944", "1939", "1950"]
    }
  ]
}
```

## 🔧 **Características del Script**

### **Limpieza Automática:**
- ✅ Elimina citaciones OAI `[oai_citation:...]`
- ✅ Elimina URLs completas
- ✅ Elimina parámetros `?utm_source=...`
- ✅ Limpia espacios extra y caracteres especiales

### **Validación:**
- ✅ Verifica que todos los campos estén completos
- ✅ Asegura que haya al menos 2 respuestas incorrectas
- ✅ Omite filas con datos incompletos

### **Estructura:**
- ✅ Crea directorio `data/` si no existe
- ✅ Genera JSON con formato legible (indentado)
- ✅ Codificación UTF-8 para caracteres especiales

## 🚨 **Solución de Problemas**

### **Error: "No se encontró el archivo preguntas.csv"**
- Verifica que el archivo esté en el directorio raíz del proyecto
- Asegúrate de que el nombre sea exactamente `preguntas.csv`

### **Error: "No se pudieron procesar preguntas"**
- Verifica que el CSV tenga el formato correcto
- Asegúrate de que haya al menos 5 columnas
- Revisa que no haya filas completamente vacías

### **Error: "No se encontró Python ni Node.js"**
- Instala Python 3: `sudo apt install python3` (Ubuntu/Debian)
- Instala Node.js: `sudo apt install nodejs` (Ubuntu/Debian)
- O descarga desde: https://python.org o https://nodejs.org

## 📈 **Resultado Esperado**

Después de la conversión exitosa, deberías ver:

```
🎉 Conversión completada exitosamente!

📋 Resumen:
   • Preguntas procesadas: 77
   • Categorías encontradas: 7
   • Archivo generado: data/preguntas.json
```

## 🔄 **Actualización Automática**

Para mantener las preguntas actualizadas:

1. **Modifica** tu archivo `preguntas.csv`
2. **Ejecuta** el script de conversión
3. **Recarga** la aplicación web

## 💡 **Consejos**

- **Backup:** Mantén una copia de tu CSV original
- **Validación:** Revisa el JSON generado antes de usar
- **Formato:** Usa comillas dobles en campos que contengan comas
- **Codificación:** Asegúrate de que el CSV esté en UTF-8

---

¡Con estos scripts podrás convertir fácilmente tu CSV a JSON y la aplicación funcionará perfectamente! 🎯 