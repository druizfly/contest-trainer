#!/usr/bin/env node
/**
 * Script para convertir preguntas.csv a preguntas.json
 * Formato compatible con la aplicación Concurso Trainer
 * 
 * Uso: node convert_csv_to_json.js
 */

const fs = require('fs');
const path = require('path');

function limpiarTexto(texto) {
    if (!texto) return "";
    
    // Eliminar citaciones de OAI y otros patrones
    texto = texto.replace(/\[oai_citation:[^\]]*\]/g, '');
    
    // Eliminar URLs
    texto = texto.replace(/https?:\/\/[^\s]+/g, '');
    
    // Eliminar parámetros de URL
    texto = texto.replace(/\?utm_source=[^\s]+/g, '');
    
    // Limpiar espacios extra y caracteres especiales
    texto = texto.trim();
    texto = texto.replace(/\s+/g, ' '); // Múltiples espacios a uno solo
    
    return texto;
}

function procesarCSV(csvContent) {
    const lineas = csvContent.split('\n');
    const headers = lineas[0].split(',').map(h => h.trim());
    
    console.log('📋 Headers encontrados:', headers);
    
    const preguntas = [];
    
    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;
        
        // Parsear CSV considerando comas dentro de campos
        const campos = [];
        let campoActual = '';
        let dentroDeComillas = false;
        
        for (let j = 0; j < linea.length; j++) {
            const char = linea[j];
            
            if (char === '"') {
                dentroDeComillas = !dentroDeComillas;
            } else if (char === ',' && !dentroDeComillas) {
                campos.push(campoActual.trim());
                campoActual = '';
            } else {
                campoActual += char;
            }
        }
        campos.push(campoActual.trim()); // Último campo
        
        if (campos.length >= 5) { // Mínimo 5 campos: Categoria, Pregunta, Respuesta Correcta, 2 incorrectas
            const categoria = limpiarTexto(campos[0]);
            const pregunta = limpiarTexto(campos[1]);
            const respuestaCorrecta = limpiarTexto(campos[2]);
            
            const respuestasIncorrectas = [];
            for (let k = 3; k < Math.min(6, campos.length); k++) {
                const respIncorrecta = limpiarTexto(campos[k]);
                if (respIncorrecta) {
                    respuestasIncorrectas.push(respIncorrecta);
                }
            }
            
            // Validar que tenemos todos los campos necesarios
            if (categoria && pregunta && respuestaCorrecta && respuestasIncorrectas.length >= 2) {
                const preguntaEstructurada = {
                    categoria: categoria,
                    pregunta: pregunta,
                    respuesta_correcta: respuestaCorrecta,
                    respuestas_incorrectas: respuestasIncorrectas
                };
                
                preguntas.push(preguntaEstructurada);
                console.log(`✓ Procesada: ${categoria} - ${pregunta.substring(0, 50)}...`);
            } else {
                console.log(`⚠ Omitida: Campos incompletos en categoría '${categoria}'`);
            }
        }
    }
    
    return preguntas;
}

function generarJSON(preguntas, outputFile) {
    // Crear directorio si no existe
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Estructura del JSON
    const categoriasUnicas = [...new Set(preguntas.map(p => p.categoria))].sort();
    
    const jsonData = {
        categorias: categoriasUnicas,
        preguntas: preguntas
    };
    
    // Escribir archivo JSON
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2), 'utf8');
    
    console.log(`\n✅ Archivo JSON generado: ${outputFile}`);
    console.log(`📊 Total de preguntas: ${preguntas.length}`);
    console.log(`🏷️  Categorías: ${categoriasUnicas.join(', ')}`);
}

function main() {
    const csvFile = 'preguntas.csv';
    const jsonFile = 'data/preguntas.json';
    
    console.log('🔄 Convirtiendo CSV a JSON...');
    console.log(`📁 Archivo de entrada: ${csvFile}`);
    console.log(`📁 Archivo de salida: ${jsonFile}`);
    console.log('-'.repeat(50));
    
    // Verificar que existe el archivo CSV
    if (!fs.existsSync(csvFile)) {
        console.log(`❌ Error: No se encontró el archivo ${csvFile}`);
        return;
    }
    
    try {
        // Leer archivo CSV
        const csvContent = fs.readFileSync(csvFile, 'utf8');
        
        // Procesar CSV
        const preguntas = procesarCSV(csvContent);
        
        if (preguntas.length === 0) {
            console.log('❌ Error: No se pudieron procesar preguntas del CSV');
            return;
        }
        
        // Generar JSON
        generarJSON(preguntas, jsonFile);
        
        console.log('\n🎉 Conversión completada exitosamente!');
        console.log('\n📋 Resumen:');
        console.log(`   • Preguntas procesadas: ${preguntas.length}`);
        console.log(`   • Categorías encontradas: ${new Set(preguntas.map(p => p.categoria)).size}`);
        console.log(`   • Archivo generado: ${jsonFile}`);
        
    } catch (error) {
        console.log(`❌ Error durante la conversión: ${error.message}`);
        console.error(error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { procesarCSV, generarJSON, limpiarTexto }; 