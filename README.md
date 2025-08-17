# 🎯 Concurso Trainer

Aplicación web para prepararse para concursos de televisión de conocimiento general.

## 🚀 Características

- **100 preguntas variadas** distribuidas en 7 categorías
- **Feedback inmediato** después de cada respuesta
- **Posición aleatoria** de la respuesta correcta
- **Resumen final** con puntuación por categoría
- **Diseño responsive** para móviles y desktop
- **Sin dependencias externas** - compatible con GitHub Pages

## 📱 Categorías de Preguntas

1. **Historia** - Eventos históricos, personajes y fechas importantes
2. **Geografía** - Países, capitales, ríos y características geográficas
3. **Ciencia y Naturaleza** - Ciencia, tecnología y fenómenos naturales
4. **Arte** - Pintura, literatura, música y cultura
5. **Cine y Series** - Películas, series de TV y entretenimiento
6. **Deportes** - Deportes, atletas y eventos deportivos
7. **Literatura** - Libros, autores y obras literarias

## 🎮 Cómo Jugar

1. **Iniciar Concurso**: Haz clic en "🚀 Iniciar Concurso"
2. **Responder Preguntas**: Selecciona la respuesta que consideres correcta
3. **Feedback Inmediato**: Recibe confirmación de si acertaste o no
4. **Continuar**: Haz clic en "Siguiente Pregunta" para continuar
5. **Ver Resultados**: Al final verás tu puntuación total y por categoría
6. **Nuevo Concurso**: Puedes iniciar un nuevo concurso cuando quieras

## 🛠️ Instalación y Uso

### Opción 1: GitHub Pages (Recomendado)

1. Haz un fork de este repositorio
2. Ve a Settings > Pages en tu repositorio
3. Selecciona la rama `main` como fuente
4. La aplicación estará disponible en `https://tuusuario.github.io/concurso_trainer`

### Opción 2: Local

1. Clona o descarga este repositorio
2. Abre `index.html` en tu navegador web
3. ¡Listo para usar!

## 📁 Estructura del Proyecto

```
concurso_trainer/
├── index.html          # Página principal de la aplicación
├── styles.css          # Estilos CSS y diseño responsive
├── script.js           # Lógica del juego y funcionalidad
├── data/
│   └── preguntas.json  # Base de datos de preguntas
├── plan.md             # Plan de implementación
└── README.md           # Este archivo
```

## 🔧 Personalización

### Agregar Nuevas Preguntas

1. Edita el archivo `data/preguntas.json`
2. Sigue el formato existente:
```json
{
  "categoria": "Nombre Categoría",
  "pregunta": "¿Tu pregunta aquí?",
  "respuesta_correcta": "Respuesta correcta",
  "respuestas_incorrectas": ["Opción 1", "Opción 2", "Opción 3"]
}
```

### Modificar Categorías

1. Edita el array `categorias` en `script.js`
2. Ajusta la distribución de preguntas por categoría

### Cambiar Estilos

1. Modifica `styles.css` para personalizar colores, fuentes y diseño
2. Los colores principales están definidos como variables CSS

## 🌐 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Móviles, tablets y desktop
- **Plataformas**: Windows, macOS, Linux, iOS, Android

## 📊 Funcionalidades Técnicas

- **Algoritmo de mezcla** para orden aleatorio de preguntas
- **Posición aleatoria** de respuestas correctas
- **Sistema de puntuación** por categoría
- **Navegación entre pantallas** con transiciones suaves
- **Manejo de errores** y validación de datos
- **Responsive design** con CSS Grid y Flexbox

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o sugerencias:

1. Abre un issue en GitHub
2. Describe el problema o sugerencia
3. Incluye detalles de tu navegador y sistema operativo

## 🎯 Roadmap

- [ ] Modo de práctica por categoría
- [ ] Temporizador para respuestas
- [ ] Estadísticas de rendimiento
- [ ] Modo multijugador
- [ ] Exportar resultados
- [ ] Temas visuales adicionales

---

¡Disfruta preparándote para tu concurso! 🎉
