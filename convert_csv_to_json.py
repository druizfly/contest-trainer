#!/usr/bin/env python3
"""
Script para convertir preguntas.csv a preguntas.json
Formato compatible con la aplicación Concurso Trainer
"""

import csv
import json
import os
from typing import List, Dict, Any

def limpiar_texto(texto: str) -> str:
    """Limpia el texto eliminando caracteres especiales y citaciones"""
    if not texto:
        return ""
    
    # Eliminar citaciones de OAI y otros patrones
    import re
    
    # Patrón para eliminar citaciones como [oai_citation:...]
    texto = re.sub(r'\[oai_citation:[^\]]*\]', '', texto)
    
    # Patrón para eliminar URLs
    texto = re.sub(r'https?://[^\s]+', '', texto)
    
    # Patrón para eliminar parámetros de URL
    texto = re.sub(r'\?utm_source=[^\s]+', '', texto)
    
    # Limpiar espacios extra y caracteres especiales
    texto = texto.strip()
    texto = re.sub(r'\s+', ' ', texto)  # Múltiples espacios a uno solo
    
    return texto

def procesar_csv(csv_file: str) -> List[Dict[str, Any]]:
    """Procesa el archivo CSV y retorna una lista de preguntas estructuradas"""
    preguntas = []
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            # Limpiar y validar cada campo
            categoria = limpiar_texto(row.get('Categoria', ''))
            pregunta = limpiar_texto(row.get('Pregunta', ''))
            respuesta_correcta = limpiar_texto(row.get('Respuesta Correcta', ''))
            
            # Obtener respuestas incorrectas
            respuestas_incorrectas = []
            for i in range(1, 4):  # Respuesta Incorrecta 1, 2, 3
                key = f'Respuesta Incorrecta {i}'
                if key in row and row[key]:
                    resp_incorrecta = limpiar_texto(row[key])
                    if resp_incorrecta:
                        respuestas_incorrectas.append(resp_incorrecta)
            
            # Validar que tenemos todos los campos necesarios
            if (categoria and pregunta and respuesta_correcta and 
                len(respuestas_incorrectas) >= 2):
                
                pregunta_estructurada = {
                    "categoria": categoria,
                    "pregunta": pregunta,
                    "respuesta_correcta": respuesta_correcta,
                    "respuestas_incorrectas": respuestas_incorrectas
                }
                
                preguntas.append(pregunta_estructurada)
                print(f"✓ Procesada: {categoria} - {pregunta[:50]}...")
            else:
                print(f"⚠ Omitida: Campos incompletos en categoría '{categoria}'")
    
    return preguntas

def generar_json(preguntas: List[Dict[str, Any]], output_file: str):
    """Genera el archivo JSON con el formato correcto"""
    
    # Crear directorio si no existe
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Estructura del JSON
    json_data = {
        "categorias": [],
        "preguntas": preguntas
    }
    
    # Extraer categorías únicas
    categorias_unicas = list(set(pregunta["categoria"] for pregunta in preguntas))
    categorias_unicas.sort()  # Ordenar alfabéticamente
    json_data["categorias"] = categorias_unicas
    
    # Escribir archivo JSON
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(json_data, file, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Archivo JSON generado: {output_file}")
    print(f"📊 Total de preguntas: {len(preguntas)}")
    print(f"🏷️  Categorías: {', '.join(categorias_unicas)}")

def main():
    """Función principal"""
    csv_file = "preguntas.csv"
    json_file = "data/preguntas.json"
    
    print("🔄 Convirtiendo CSV a JSON...")
    print(f"📁 Archivo de entrada: {csv_file}")
    print(f"📁 Archivo de salida: {json_file}")
    print("-" * 50)
    
    # Verificar que existe el archivo CSV
    if not os.path.exists(csv_file):
        print(f"❌ Error: No se encontró el archivo {csv_file}")
        return
    
    try:
        # Procesar CSV
        preguntas = procesar_csv(csv_file)
        
        if not preguntas:
            print("❌ Error: No se pudieron procesar preguntas del CSV")
            return
        
        # Generar JSON
        generar_json(preguntas, json_file)
        
        print("\n🎉 Conversión completada exitosamente!")
        print("\n📋 Resumen:")
        print(f"   • Preguntas procesadas: {len(preguntas)}")
        print(f"   • Categorías encontradas: {len(set(p['categoria'] for p in preguntas))}")
        print(f"   • Archivo generado: {json_file}")
        
    except Exception as e:
        print(f"❌ Error durante la conversión: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 