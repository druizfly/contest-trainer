// Estado global del juego
let estadoJuego = {
    preguntas: [],
    preguntaActual: 0,
    puntuacion: {},
    preguntasSeleccionadas: [],
    totalPreguntas: 5
};

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
    cargarPreguntas();
    configurarEventListeners();
}

async function cargarPreguntas() {
    try {
        const response = await fetch('data/preguntas.json');
        const data = await response.json();
        
        // Filtrar preguntas únicas y distribuir por categoría
        const preguntasUnicas = filtrarPreguntasUnicas(data.preguntas);
        estadoJuego.preguntas = distribuirPreguntasPorCategoria(preguntasUnicas);
        
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
    const categorias = ['Historia', 'Geografía', 'Ciencia y Naturaleza', 'Arte', 'Cine y Series', 'Deportes', 'Literatura'];
    const preguntasPorCategoria = Math.floor(estadoJuego.totalPreguntas / categorias.length);
    const preguntasSeleccionadas = [];
    
    categorias.forEach(categoria => {
        const preguntasCategoria = preguntas.filter(p => p.categoria === categoria);
        const preguntasAleatorias = obtenerPreguntasAleatorias(preguntasCategoria, preguntasPorCategoria);
        preguntasSeleccionadas.push(...preguntasAleatorias);
    });
    
    // Mezclar todas las preguntas para orden aleatorio
    return mezclarArray(preguntasSeleccionadas);
}

function obtenerPreguntasAleatorias(preguntas, cantidad) {
    const preguntasMezcladas = mezclarArray([...preguntas]);
    return preguntasMezcladas.slice(0, Math.min(cantidad, preguntasMezcladas.length));
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
    estadoJuego.preguntaActual = 0;
    reiniciarPuntuacion();
    mostrarPantalla('pregunta');
    mostrarPregunta();
}

function reiniciarPuntuacion() {
    Object.keys(estadoJuego.puntuacion).forEach(categoria => {
        estadoJuego.puntuacion[categoria] = { correctas: 0, total: 0 };
    });
}

function mostrarPantalla(pantalla) {
    // Ocultar todas las pantallas
    Object.values(pantallas).forEach(p => p.classList.remove('activa'));
    
    // Mostrar la pantalla solicitada
    pantallas[pantalla].classList.add('activa');
}

function mostrarPregunta() {
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
    estadoJuego.preguntaActual = 0;
    reiniciarPuntuacion();
    mostrarPantalla('inicio');
} 