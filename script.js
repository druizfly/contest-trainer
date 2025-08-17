// Estado del juego
const estadoJuego = {
    preguntaActual: 0,
    totalPreguntas: 100,
    preguntas: [],
    preguntasOriginales: [],
    puntuacion: {},
    preguntasSeleccionadas: []
};

// Referencias a elementos del DOM
const elementos = {
    btnIniciar: document.getElementById('btn-iniciar'),
    btnSiguiente: document.getElementById('btn-siguiente'),
    btnNuevoConcurso: document.getElementById('btn-nuevo-concurso'),
    preguntaTexto: document.getElementById('pregunta-texto'),
    categoriaActual: document.getElementById('categoria-actual'),
    contadorPregunta: document.getElementById('contador-pregunta'),
    opcionesBtns: document.querySelectorAll('.opcion-btn'),
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
    const preguntasMezcladas = mezclarArray([...preguntas]);
    return preguntasMezcladas.slice(0, Math.min(cantidad, preguntas.length));
}

function mezclarArray(array) {
    const nuevoArray = [...array];
    for (let i = nuevoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
    }
    return nuevoArray;
}

function inicializarPuntuacion() {
    const categorias = ['Historia', 'Geografía', 'Ciencia y Naturaleza', 'Arte', 'Cine y Series', 'Deportes', 'Literatura'];
    categorias.forEach(categoria => {
        estadoJuego.puntuacion[categoria] = {
            correctas: 0,
            total: 0
        };
    });
}

function configurarEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botón iniciar concurso
    elementos.btnIniciar.addEventListener('click', iniciarConcurso);
    
    // Botón siguiente pregunta
    elementos.btnSiguiente.addEventListener('click', siguientePregunta);
    
    // Botón nuevo concurso
    elementos.btnNuevoConcurso.addEventListener('click', reiniciarJuego);
    
    // Opciones de respuesta
    elementos.opcionesBtns.forEach(btn => {
        btn.addEventListener('click', () => seleccionarRespuesta(btn));
    });
    
    console.log('Event listeners configurados');
}

function iniciarConcurso() {
    console.log('Iniciando concurso...');
    
    // Verificar que tenemos preguntas
    if (estadoJuego.preguntas.length === 0 && estadoJuego.preguntasOriginales.length > 0) {
        estadoJuego.preguntas = [...estadoJuego.preguntasOriginales];
    }
    
    if (estadoJuego.preguntas.length === 0) {
        alert('No hay preguntas disponibles. Por favor, recarga la página.');
        return;
    }
    
    // Mezclar preguntas al inicio
    estadoJuego.preguntas = mezclarArray([...estadoJuego.preguntas]);
    
    // Resetear estado
    estadoJuego.preguntaActual = 0;
    reiniciarPuntuacion();
    
    // Mostrar primera pregunta
    mostrarPregunta();
    
    // Cambiar a pantalla de pregunta
    mostrarPantalla('pregunta');
}

function mostrarPantalla(pantalla) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    
    // Mostrar pantalla solicitada
    document.getElementById(`pantalla-${pantalla}`).classList.add('activa');
}

function mostrarPregunta() {
    console.log('Mostrando pregunta:', estadoJuego.preguntaActual);
    
    if (estadoJuego.preguntas.length === 0) {
        console.error('No hay preguntas disponibles');
        if (estadoJuego.preguntasOriginales.length > 0) {
            estadoJuego.preguntas = [...estadoJuego.preguntasOriginales];
            estadoJuego.preguntas = mezclarArray([...estadoJuego.preguntas]);
        } else {
            alert('No se pueden restaurar las preguntas');
            mostrarPantalla('inicio');
            return;
        }
    }
    
    if (estadoJuego.preguntaActual >= estadoJuego.preguntas.length) {
        mostrarResultados();
        return;
    }
    
    const pregunta = estadoJuego.preguntas[estadoJuego.preguntaActual];
    
    // Mostrar pregunta y categoría
    elementos.preguntaTexto.textContent = pregunta.pregunta;
    elementos.categoriaActual.textContent = pregunta.categoria;
    elementos.contadorPregunta.textContent = `Pregunta ${estadoJuego.preguntaActual + 1} de ${estadoJuego.totalPreguntas}`;
    
    // Preparar opciones
    const opciones = prepararOpciones(pregunta);
    
    // Configurar botones de opciones
    elementos.opcionesBtns.forEach((btn, index) => {
        btn.textContent = opciones[index];
        btn.className = 'opcion-btn';
        btn.disabled = false;
        btn.dataset.respuesta = opciones[index];
    });
    
    // Ocultar botón siguiente
    console.log('Ocultando botón siguiente...');
    elementos.btnSiguiente.style.display = 'none';
    console.log('Estado del botón después de ocultar:', elementos.btnSiguiente.style.display);
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
    
    // Mostrar botón siguiente
    console.log('Mostrando botón siguiente...');
    elementos.btnSiguiente.style.display = 'block';
    console.log('Estado del botón:', elementos.btnSiguiente.style.display);
}

function actualizarPuntuacion(categoria, esCorrecta) {
    estadoJuego.puntuacion[categoria].total++;
    if (esCorrecta) {
        estadoJuego.puntuacion[categoria].correctas++;
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

function reiniciarPuntuacion() {
    const categorias = ['Historia', 'Geografía', 'Ciencia y Naturaleza', 'Arte', 'Cine y Series', 'Deportes', 'Literatura'];
    categorias.forEach(categoria => {
        estadoJuego.puntuacion[categoria] = {
            correctas: 0,
            total: 0
        };
    });
    estadoJuego.preguntasSeleccionadas = [];
} 