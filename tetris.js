// Obtener el canvas y su contexto para dibujar
const canvas = document.getElementById("tetris"); // Obtener el canvas donde dibujaremos el juego
const lienzo = canvas.getContext("2d"); // Obtener el contexto de dibujo del canvas

// Definir las dimensiones del tablero y las celdas
const filas = 20; // El número de filas en el tablero
const columnas = 10; // El número de columnas en el tablero
const tamanoCelda = 30; // El tamaño de cada celda en píxeles
let puntuacion = 0; // Inicializamos la puntuación a 0
let intervalo; // Variable para controlar el intervalo del juego

// Crear el tablero vacío con las dimensiones indicadas
const tablero = [];
for (let i = 0; i < filas; i++) {
  const fila = [];
  for (let j = 0; j < columnas; j++) {
    fila.push(0); // 0 significa que la celda está vacía
  }
  tablero.push(fila); // Añadir la fila al tablero
}

// Definir las piezas posibles con sus características
const piezas = [
  {
    nombre: "C", // Nombre de la pieza
    forma: [
      [1, 1, 1],  // La forma de la pieza en matriz (1 significa bloque ocupado)
      [1, 0, 1], 
    ],
    probabilidad: 0.2, // Probabilidad de que esta pieza aparezca
    color: "red", // Color de la pieza
  },
  {
    nombre: "L",
    forma: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    probabilidad: 0.2,
    color: "brown",
  },
  {
    nombre: "O",
    forma: [
      [1, 1],
      [1, 1],
    ],
    probabilidad: 0.2,
    color: "purple",
  },
  {
    nombre: "T",
    forma: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    probabilidad: 0.2,
    color: "yellow",
  },
  {
    nombre: "I",
    forma: [[1, 1, 1, 1]],
    probabilidad: 0.2,
    color: "orange",
  },
];

// Ajustar el tamaño del canvas en base a las filas y columnas
canvas.width = columnas * tamanoCelda; // Ancho del canvas
canvas.height = filas * tamanoCelda; // Alto del canvas

// Definir las variables para la pieza actual y la siguiente
let piezaActual;
let piezaProxima;

let nivel = 1; // Nivel inicial
let velocidad = obtenerVelocidad(); // Establecer la velocidad según el nivel

// Función que inicia el juego
function jugar() {
  puntuacion = 0; // Reiniciar la puntuación
  nivel = 1; // Reiniciar el nivel
  velocidad = obtenerVelocidad(); // Establecer la velocidad inicial
  actualizarPuntuacion(); // Actualizar la puntuación en la pantalla

  // Limpiar el tablero
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      tablero[i][j] = 0; // Llenamos todas las celdas con 0 (vacías)
    }
  }

  // Generar las piezas
  piezaActual = generarPieza();
  piezaProxima = generarPieza();
  dibujarProximaPieza(piezaProxima); // Dibujar la próxima pieza en la interfaz

  // Inicializar las posiciones de la pieza actual
  posicionX = Math.floor(columnas / 2) * tamanoCelda;
  posicionY = 0;

  // Dibujar el tablero vacío
  dibujarTablero();

  // Iniciar el intervalo con la velocidad de juego
  if (intervalo) clearInterval(intervalo); // Limpiar el intervalo si ya está corriendo
  intervalo = setInterval(actualizar, velocidad); // Establecer un nuevo intervalo
}

// Función que dibuja el tablero en el canvas
function dibujarTablero() {
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const x = j * tamanoCelda;
      const y = i * tamanoCelda;

      // Si la celda está ocupada, la dibujamos en gris, si está vacía la dibujamos en negro
      lienzo.fillStyle = tablero[i][j] === 1 ? "#ddd" : "#000"; 
      lienzo.fillRect(x, y, tamanoCelda, tamanoCelda); // Dibuja la celda

      lienzo.strokeStyle = "white"; // Borde blanco
      lienzo.strokeRect(x, y, tamanoCelda, tamanoCelda); // Dibuja el borde
    }
  }
}

// Función para dibujar una pieza en el tablero
function dibujarPieza(pieza, x, y) {
  const forma = pieza.forma; // Obtener la forma de la pieza
  lienzo.fillStyle = pieza.color; // Establecer el color de la pieza

  // Dibujar cada bloque de la pieza
  for (let i = 0; i < forma.length; i++) {
    for (let j = 0; j < forma[i].length; j++) {
      if (forma[i][j] === 1) { // Si hay un bloque en esta posición
        const celdaX = x + j * tamanoCelda; // Calcular la posición en el canvas
        const celdaY = y + i * tamanoCelda;
        lienzo.fillRect(celdaX, celdaY, tamanoCelda, tamanoCelda); // Dibujar el bloque

        lienzo.strokeStyle = "white"; // Bordes blancos
        lienzo.strokeRect(celdaX, celdaY, tamanoCelda, tamanoCelda); // Dibujar el borde
      }
    }
  }
}

// Función para generar una pieza aleatoria
function generarPieza() {
  const numRandom = Math.random(); // Generar un número aleatorio
  let probAcumulada = 0;

  // Seleccionar una pieza según su probabilidad
  for (const pieza of piezas) {
    probAcumulada += pieza.probabilidad;
    if (numRandom < probAcumulada) {
      return pieza; // Retornar la pieza seleccionada
    }
  }
  return piezas[0]; // Si no se seleccionó ninguna, devolvemos la primera pieza
}

// Función para chequear si la pieza tiene colisiones
function chequearColisiones(pieza, x, y) {
  const forma = pieza.forma; // Obtener la forma de la pieza

  // Recorrer la forma de la pieza para comprobar colisiones
  for (let i = 0; i < forma.length; i++) {
    for (let j = 0; j < forma[i].length; j++) {
      if (forma[i][j] === 1) { // Si hay un bloque de la pieza
        const tableroX = x / tamanoCelda + j; // Posición en el tablero
        const tableroY = y / tamanoCelda + i;

        // Comprobar si colide con los bordes o con otras piezas
        if (
          tableroX < 0 ||
          tableroX >= columnas ||
          tableroY >= filas ||
          tablero[tableroY][tableroX] === 1
        ) {
          return true; // Hay colisión
        }
      }
    }
  }
  return false; // No hay colisión
}

// Función para colocar la pieza en el tablero
function posicionaPieza(pieza, x, y) {
  const forma = pieza.forma;

  // Colocar cada bloque de la pieza en el tablero
  for (let i = 0; i < forma.length; i++) {
    for (let j = 0; j < forma[i].length; j++) {
      if (forma[i][j] === 1) { // Si hay un bloque
        const tableroX = x / tamanoCelda + j;
        const tableroY = y / tamanoCelda + i;
        tablero[tableroY][tableroX] = 1; // Colocamos el bloque en el tablero
      }
    }
  }
}

// Función para eliminar una línea completa del tablero
function eliminarLinea() {
  for (let i = 0; i < filas; i++) {
    if (tablero[i].every((celda) => celda === 1)) { // Si toda la fila está llena
      tablero.splice(i, 1); // Eliminar la fila completa
      tablero.unshift(new Array(columnas).fill(0)); // Agregar una fila vacía al inicio
      puntuacion += 100; // Aumentar la puntuación
      actualizarPuntuacion(); // Actualizar la puntuación en la pantalla
      actualizarNivel(); // Comprobar si debemos aumentar el nivel
    }
  }
}

// Función para actualizar la puntuación en la interfaz
function actualizarPuntuacion() {
  const marcador = document.getElementById("puntuacion");
  marcador.textContent = "Puntuación: " + puntuacion;
}

// Función que se ejecuta para actualizar el juego
function actualizar() {
  if (chequearColisiones(piezaActual, posicionX, posicionY + tamanoCelda)) {
    posicionaPieza(piezaActual, posicionX, posicionY); // Colocar la pieza en el tablero
    eliminarLinea(); // Eliminar cualquier línea completa

    piezaActual = piezaProxima; // Establecer la próxima pieza
    piezaProxima = generarPieza(); // Generar una nueva pieza
    dibujarProximaPieza(piezaProxima); // Dibujar la próxima pieza

    // Resetear las posiciones de la pieza
    posicionX = Math.floor(columnas / 2) * tamanoCelda;
    posicionY = 0;

    // Comprobar si la nueva pieza colide inmediatamente
    if (chequearColisiones(piezaActual, posicionX, posicionY)) {
      alert("FIN DE LA PARTIDA, este juego ha sido desarrollado por Enrique Ferrer Rigo. \nLa puntuación ha sido de " + puntuacion + " puntos.");
      clearInterval(intervalo); // Detener el intervalo del juego
    }
  } else {
    posicionY += tamanoCelda; // Mover la pieza hacia abajo
  }

  dibujarTablero(); // Dibujar el tablero
  dibujarPieza(piezaActual, posicionX, posicionY); // Dibujar la pieza actual
}

// Event listener para los controles del teclado (mover y rotar la pieza)
document.addEventListener("keydown", (evento) => {
  if (
    evento.key === "a" &&
    !chequearColisiones(piezaActual, posicionX - tamanoCelda, posicionY)
  ) {
    posicionX -= tamanoCelda; // Mover a la izquierda
  } else if (
    evento.key === "d" &&
    !chequearColisiones(piezaActual, posicionX + tamanoCelda, posicionY)
  ) {
    posicionX += tamanoCelda; // Mover a la derecha
  } else if (
    evento.key === "s" &&
    !chequearColisiones(piezaActual, posicionX, posicionY + tamanoCelda)
  ) {
    posicionY += tamanoCelda; // Mover hacia abajo
  } else if (evento.key === "w") {
    rotarPieza(); // Rotar la pieza
  }

  dibujarTablero();
  dibujarPieza(piezaActual, posicionX, posicionY); // Actualizar la pieza en la pantalla
});

// Función para rotar la pieza
function rotarPieza() {
  const forma = piezaActual.forma;
  const filas = forma.length;
  const columnas = forma[0].length;

  const formaRotada = [];

  for (let i = 0; i < columnas; i++) {
    formaRotada[i] = [];
    for (let j = 0; j < filas; j++) {
      formaRotada[i][j] = forma[filas - 1 - j][i]; // Rotación de la pieza
    }
  }

  piezaActual.forma = formaRotada; // Actualizar la forma de la pieza
}

// Función para dibujar la próxima pieza que aparecerá
function dibujarProximaPieza(pieza) {
  const canvasProxima = document.getElementById("proximaFicha");
  const lienzoProxima = canvasProxima.getContext("2d");
  lienzoProxima.clearRect(0, 0, canvasProxima.width, canvasProxima.height); // Limpiar el canvas

  const forma = pieza.forma;
  const tamanoCeldaPequeña = 30;
  const desplazamientoX =
    (canvasProxima.width - forma[0].length * tamanoCeldaPequeña) / 2;
  const desplazamientoY =
    (canvasProxima.height - forma.length * tamanoCeldaPequeña) / 2;

  lienzoProxima.fillStyle = pieza.color; // Establecer el color de la pieza

  // Dibujar la próxima pieza en el canvas pequeño
  for (let i = 0; i < forma.length; i++) {
    for (let j = 0; j < forma[i].length; j++) {
      if (forma[i][j] === 1) {
        const x = desplazamientoX + j * tamanoCeldaPequeña;
        const y = desplazamientoY + i * tamanoCeldaPequeña;
        lienzoProxima.fillRect(x, y, tamanoCeldaPequeña, tamanoCeldaPequeña);
        lienzoProxima.strokeStyle = "white";
        lienzoProxima.strokeRect(x, y, tamanoCeldaPequeña, tamanoCeldaPequeña);
      }
    }
  }
}

// Función para obtener la velocidad según el nivel
function obtenerVelocidad() {
  if (nivel >= 300) {
    return 100;  // Más rápido en nivel 3
  } else if (nivel >= 100) {
    return 250;  // Velocidad media en nivel 2
  } else {
    return 500;  // Velocidad inicial
  }
}

// Función para actualizar el nivel según la puntuación
function actualizarNivel() {
  if (puntuacion >= 300) {
    nivel = 3;
  } else if (puntuacion >= 100) {
    nivel = 2;
  } else {
    nivel = 1;
  }
  velocidad = obtenerVelocidad(); // Actualizar velocidad según el nivel
  clearInterval(intervalo); // Detener el intervalo anterior
  intervalo = setInterval(actualizar, velocidad); // Establecer el nuevo intervalo
}

