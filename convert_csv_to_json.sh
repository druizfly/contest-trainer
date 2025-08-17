#!/bin/bash

# Script para convertir preguntas.csv a preguntas.json
# Formato compatible con la aplicación Concurso Trainer

echo "🔄 Convirtiendo CSV a JSON..."

# Verificar que existe el archivo CSV
if [ ! -f "preguntas.csv" ]; then
    echo "❌ Error: No se encontró el archivo preguntas.csv"
    exit 1
fi

# Crear directorio data si no existe
mkdir -p data

# Convertir CSV a JSON usando Python (si está disponible)
if command -v python3 &> /dev/null; then
    echo "🐍 Usando Python 3..."
    python3 convert_csv_to_json.py
elif command -v python &> /dev/null; then
    echo "🐍 Usando Python..."
    python convert_csv_to_json.py
elif command -v node &> /dev/null; then
    echo "🟢 Usando Node.js..."
    node convert_csv_to_json.js
else
    echo "❌ Error: No se encontró Python ni Node.js instalado"
    echo "💡 Instala Python 3 o Node.js para usar este script"
    exit 1
fi

echo "✅ Conversión completada!"
echo "📁 Archivo generado: data/preguntas.json" 