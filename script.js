// Estado global del juego
let estadoJuego = {
    preguntas: [],
    preguntasOriginales: [], // Guardar copia de las preguntas originales
    preguntaActual: 0,
    puntuacion: {},
    preguntasSeleccionadas: [],
    totalPreguntas: 50
};

console.log('Estado del juego inicializado con totalPreguntas:', estadoJuego.totalPreguntas);

// Elementos del DOM
const pantallas = {
    inicio: document.getElementById('pantalla-inicio'),
    pregunta: document.getElementById('pantalla-pregunta'),
    resultados: document.getElementById('pantalla-resultados')
};

const elementos = {
    btnIniciar: document.getElementById('btn-iniciar'),
    btnSiguiente: document.getElementById('btn-siguiente'),
    btnNuevoConcurso: document.getElementById('btn-nuevo-concurso'),
    preguntaTexto: document.getElementById('pregunta-texto'),
    categoriaActual: document.getElementById('categoria-actual'),
    contadorPregunta: document.getElementById('contador-pregunta'),
    opcionesBtns: document.querySelectorAll('.opcion-btn'),
    feedbackContainer: document.getElementById('feedback-container'),
    feedbackMensaje: document.getElementById('feedback-mensaje'),
    puntuacionTotal: document.getElementById('puntuacion-total'),
    categoriasGrid: document.getElementById('categorias-grid')
};

// Inicialización
document.addEventListener('DOMContentLoaded', inicializarJuego);

function inicializarJuego() {
    console.log('Inicializando juego...');
    cargarPreguntas().then(() => {
        console.log('Preguntas cargadas, configurando event listeners...');
        configurarEventListeners();
    }).catch(error => {
        console.error('Error en la inicialización:', error);
    });
}

async function cargarPreguntas() {
    try {
        const response = await fetch('data/preguntas.json');
        const data = await response.json();
        
        console.log('Datos cargados:', data);
        
        // Filtrar preguntas únicas y distribuir por categoría
        const preguntasUnicas = filtrarPreguntasUnicas(data.preguntas);
        console.log('Preguntas únicas:', preguntasUnicas.length);
        
        estadoJuego.preguntas = distribuirPreguntasPorCategoria(preguntasUnicas);
        console.log('Preguntas distribuidas:', estadoJuego.preguntas.length);
        
        // Guardar copia de las preguntas originales para poder reiniciar
        estadoJuego.preguntasOriginales = [...estadoJuego.preguntas];
        console.log('Preguntas originales guardadas:', estadoJuego.preguntasOriginales.length);
        
        // Inicializar puntuación
        inicializarPuntuacion();
        
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        alert('Error cargando las preguntas. Por favor, recarga la página.');
    }
}

function filtrarPreguntasUnicas(preguntas) {
    const preguntasUnicas = [];
    const preguntasVistas = new Set();
    
    for (const pregunta of preguntas) {
        const clave = pregunta.pregunta + pregunta.respuesta_correcta;
        if (!preguntasVistas.has(clave)) {
            preguntasVistas.add(clave);
            preguntasUnicas.push(pregunta);
        }
    }
    
    return preguntasUnicas;
}

function distribuirPreguntasPorCategoria(preguntas) {
    console.log('Distribuyendo preguntas...');
    console.log('Total de preguntas disponibles:', preguntas.length);
    
    const categorias = ['Historia', 'Geografía', 'Ciencia y Naturaleza', 'Arte', 'Cine y Series', 'Deportes', 'Literatura'];
    
    // Asegurar que cada categoría reciba al menos 1 pregunta
    let preguntasPorCategoria = Math.max(1, Math.floor(estadoJuego.totalPreguntas / categorias.length));
    
    console.log('Preguntas por categoría (mínimo 1):', preguntasPorCategoria);
    console.log('Categorías a procesar:', categorias);
    
    const preguntasSeleccionadas = [];
    
    categorias.forEach(categoria => {
        const preguntasCategoria = preguntas.filter(p => p.categoria === categoria);
        console.log(`Categoría ${categoria}: ${preguntasCategoria.length} preguntas encontradas`);
        
        const preguntasAleatorias = obtenerPreguntasAleatorias(preguntasCategoria, preguntasPorCategoria);
        console.log(`Categoría ${categoria}: ${preguntasAleatorias.length} preguntas seleccionadas`);
        
        preguntasSeleccionadas.push(...preguntasAleatorias);
    });
    
    console.log('Total de preguntas seleccionadas:', preguntasSeleccionadas.length);
    
    // Mezclar todas las preguntas para orden aleatorio
    return mezclarArray(preguntasSeleccionadas);
}

function obtenerPreguntasAleatorias(preguntas, cantidad) {
    console.log(`Obteniendo ${cantidad} preguntas de ${preguntas.length} disponibles`);
    
    if (preguntas.length === 0) {
        console.log('No hay preguntas en esta categoría');
        return [];
    }
    
    const preguntasMezcladas = mezclarArray([...preguntas]);
    const preguntasSeleccionadas = preguntasMezcladas.slice(0, Math.min(cantidad, preguntasMezcladas.length));
    
    console.log(`Seleccionadas: ${preguntasSeleccionadas.length} preguntas`);
    return preguntasSeleccionadas;
}

function mezclarArray(array) {
    const arrayMezclado = [...array];
    for (let i = arrayMezclado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayMezclado[i], arrayMezclado[j]] = [arrayMezclado[j], arrayMezclado[i]];
    }
    return arrayMezclado;
}

function inicializarPuntuacion() {
    const categorias = ['Historia', 'Geografía', 'Ciencia y Naturaleza', 'Arte', 'Cine y Series', 'Deportes', 'Literatura'];
    categorias.forEach(categoria => {
        estadoJuego.puntuacion[categoria] = { correctas: 0, total: 0 };
    });
}

function configurarEventListeners() {
    elementos.btnIniciar.addEventListener('click', iniciarConcurso);
    elementos.btnSiguiente.addEventListener('click', siguientePregunta);
    elementos.btnNuevoConcurso.addEventListener('click', reiniciarJuego);
    
    // Event listeners para las opciones
    elementos.opcionesBtns.forEach(btn => {
        btn.addEventListener('click', () => seleccionarRespuesta(btn));
    });
}

function iniciarConcurso() {
    console.log('Iniciando concurso...');
    console.log('Preguntas disponibles:', estadoJuego.preguntas.length);
    console.log('Preguntas originales:', estadoJuego.preguntasOriginales.length);
    
    // Resetear el estado del juego
    estadoJuego.preguntaActual = 0;
    reiniciarPuntuacion();
    
    // Asegurar que tenemos las preguntas disponibles
    if (estadoJuego.preguntas.length === 0) {
        if (estadoJuego.preguntasOriginales.length > 0) {
            console.log('Restaurando desde preguntas originales...');
            estadoJuego.preguntas = [...estadoJuego.preguntasOriginales];
        } else {
            console.error('No hay preguntas originales disponibles');
            alert('Error: No se pueden cargar las preguntas. Por favor, recarga la página.');
            return;
        }
    }
    
    // Mezclar las preguntas para orden aleatorio
    estadoJuego.preguntas = mezclarArray([...estadoJuego.preguntas]);
    console.log('Preguntas mezcladas:', estadoJuego.preguntas.length);
    
    // Ir a la primera pregunta
    mostrarPantalla('pregunta');
    mostrarPregunta();
}

function reiniciarPuntuacion() {
    // Reiniciar puntuación de todas las categorías
    Object.keys(estadoJuego.puntuacion).forEach(categoria => {
        estadoJuego.puntuacion[categoria] = { correctas: 0, total: 0 };
    });
    
    // Resetear también el array de preguntas seleccionadas si existe
    if (estadoJuego.preguntasSeleccionadas) {
        estadoJuego.preguntasSeleccionadas = [];
    }
}

function mostrarPantalla(pantalla) {
    // Ocultar todas las pantallas
    Object.values(pantallas).forEach(p => p.classList.remove('activa'));
    
    // Mostrar la pantalla solicitada
    pantallas[pantalla].classList.add('activa');
}

function mostrarPregunta() {
    console.log('Mostrando pregunta...');
    console.log('Pregunta actual:', estadoJuego.preguntaActual);
    console.log('Preguntas disponibles:', estadoJuego.preguntas.length);
    console.log('Preguntas originales:', estadoJuego.preguntasOriginales.length);
    
    // Validar que hay preguntas disponibles
    if (!estadoJuego.preguntas || estadoJuego.preguntas.length === 0) {
        console.error('No hay preguntas disponibles, intentando restaurar...');
        
        // Intentar restaurar desde las preguntas originales
        if (estadoJuego.preguntasOriginales.length > 0) {
            console.log('Restaurando preguntas desde originales...');
            estadoJuego.preguntas = [...estadoJuego.preguntasOriginales];
            estadoJuego.preguntas = mezclarArray([...estadoJuego.preguntas]);
        } else {
            console.error('No se pueden restaurar las preguntas');
            alert('Error: No se pueden cargar las preguntas. Por favor, recarga la página.');
            mostrarPantalla('inicio');
            return;
        }
    }
    
    // Verificar si hemos terminado todas las preguntas
    if (estadoJuego.preguntaActual >= estadoJuego.preguntas.length) {
        mostrarResultados();
        return;
    }
    
    const pregunta = estadoJuego.preguntas[estadoJuego.preguntaActual];
    
    // Mostrar contador de pregunta
    elementos.contadorPregunta.textContent = `Pregunta ${estadoJuego.preguntaActual + 1} de ${estadoJuego.totalPreguntas}`;
    
    // Mostrar categoría
    elementos.categoriaActual.textContent = pregunta.categoria;
    
    // Mostrar pregunta
    elementos.preguntaTexto.textContent = pregunta.pregunta;
    
    // Preparar opciones
    const opciones = prepararOpciones(pregunta);
    
    // Mostrar opciones
    elementos.opcionesBtns.forEach((btn, index) => {
        btn.textContent = opciones[index];
        btn.className = 'opcion-btn';
        btn.disabled = false;
        btn.dataset.respuesta = opciones[index];
    });
    
    // Ocultar feedback y botón siguiente
    elementos.feedbackContainer.style.display = 'none';
    elementos.btnSiguiente.style.display = 'none';
}

function prepararOpciones(pregunta) {
    const opciones = [
        pregunta.respuesta_correcta,
        ...pregunta.respuestas_incorrectas
    ];
    
    // Mezclar opciones para posición aleatoria
    return mezclarArray(opciones);
}

function seleccionarRespuesta(btnSeleccionado) {
    const pregunta = estadoJuego.preguntas[estadoJuego.preguntaActual];
    const respuestaSeleccionada = btnSeleccionado.dataset.respuesta;
    const esCorrecta = respuestaSeleccionada === pregunta.respuesta_correcta;
    
    // Deshabilitar todas las opciones
    elementos.opcionesBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('deshabilitado');
        
        if (btn.dataset.respuesta === pregunta.respuesta_correcta) {
            btn.classList.add('correcta');
        } else if (btn === btnSeleccionado && !esCorrecta) {
            btn.classList.add('incorrecta');
        }
    });
    
    // Actualizar puntuación
    actualizarPuntuacion(pregunta.categoria, esCorrecta);
    
    // Mostrar feedback
    mostrarFeedback(esCorrecta);
    
    // Mostrar botón siguiente
    elementos.btnSiguiente.style.display = 'block';
}

function actualizarPuntuacion(categoria, esCorrecta) {
    estadoJuego.puntuacion[categoria].total++;
    if (esCorrecta) {
        estadoJuego.puntuacion[categoria].correctas++;
    }
}

function mostrarFeedback(esCorrecta) {
    elementos.feedbackContainer.style.display = 'block';
    
    if (esCorrecta) {
        elementos.feedbackMensaje.textContent = '¡Correcto! 🎉';
        elementos.feedbackMensaje.className = 'feedback-mensaje correcto mostrar';
    } else {
        elementos.feedbackMensaje.textContent = 'Incorrecto ❌';
        elementos.feedbackMensaje.className = 'feedback-mensaje incorrecto mostrar';
    }
}

function siguientePregunta() {
    estadoJuego.preguntaActual++;
    mostrarPregunta();
}

function mostrarResultados() {
    mostrarPantalla('resultados');
    
    // Calcular puntuación total
    const puntuacionTotal = calcularPuntuacionTotal();
    elementos.puntuacionTotal.textContent = `${puntuacionTotal.correctas}/${puntuacionTotal.total} (${puntuacionTotal.porcentaje}%)`;
    
    // Mostrar resultados por categoría
    mostrarResultadosPorCategoria();
}

function calcularPuntuacionTotal() {
    let totalCorrectas = 0;
    let totalPreguntas = 0;
    
    Object.values(estadoJuego.puntuacion).forEach(categoria => {
        totalCorrectas += categoria.correctas;
        totalPreguntas += categoria.total;
    });
    
    const porcentaje = totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;
    
    return {
        correctas: totalCorrectas,
        total: totalPreguntas,
        porcentaje: porcentaje
    };
}

function mostrarResultadosPorCategoria() {
    elementos.categoriasGrid.innerHTML = '';
    
    Object.entries(estadoJuego.puntuacion).forEach(([categoria, puntuacion]) => {
        const porcentaje = puntuacion.total > 0 ? Math.round((puntuacion.correctas / puntuacion.total) * 100) : 0;
        
        // Determinar el color del porcentaje basado en el rendimiento
        let colorClase = '';
        if (porcentaje >= 80) colorClase = 'excelente';
        else if (porcentaje >= 60) colorClase = 'bueno';
        else if (porcentaje >= 40) colorClase = 'regular';
        else colorClase = 'mejorar';
        
        const categoriaElement = document.createElement('div');
        categoriaElement.className = `categoria-item ${colorClase}`;
        categoriaElement.innerHTML = `
            <div class="categoria-nombre">${categoria}</div>
            <div class="categoria-puntuacion">${puntuacion.correctas}/${puntuacion.total}</div>
            <div class="categoria-porcentaje ${colorClase}">${porcentaje}%</div>
        `;
        
        elementos.categoriasGrid.appendChild(categoriaElement);
    });
}

function reiniciarJuego() {
    // Resetear completamente el estado del juego
    estadoJuego.preguntaActual = 0;
    reiniciarPuntuacion();
    
    // Restaurar las preguntas originales y mezclarlas nuevamente
    estadoJuego.preguntas = [...estadoJuego.preguntasOriginales];
    estadoJuego.preguntas = mezclarArray([...estadoJuego.preguntas]);
    
    // Volver a la pantalla de inicio
    mostrarPantalla('inicio');
} 