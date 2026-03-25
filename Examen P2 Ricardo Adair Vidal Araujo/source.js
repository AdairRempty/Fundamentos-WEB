// Lista de lenguajes
const lenguaje = [
    "JavaScript",
    "CSS",
    "HTML",
    "React",
    "Angular",
    "Node",
    "Java",
    "Python",
    "C#",
    "C++",
    "Ruby",
    "PHP",
    "Swift",
    "Go",
    "Kotlin",
];

// Media Queries
const buscar = document.getElementById("buscar");
const texto = document.getElementById("texto");

function muestraCartas(array) {
    // Caso de que no hay texto para mostrar
    if (array.length === 0) {
        texto.innerHTML = "";
        return;
    }

    // Variable vacia de texto para el html de las cartas
    let cartas = "";

    // el innerHTML que se arma con todos los elementos del array
    for (let i = 0; i < array.length; i++) {
        cartas += `<div class="card">${array[i]}</div>`;
    }
    texto.innerHTML = cartas;
}

function busqueda(query) {
    // Filtro de busqueda, uso lowercase porque al parecer javascript tambien es sencible a mayusculas y minusculas.
    const value = query.toLowerCase();
    // Variable vacia para guardar los resultados que tendra el texto
    const resultado = [];

    for (let i = 0; i < lenguaje.length; i++) {
        // Uso include en vez de la comparacion if == porque si no no comprueba que tenga coincidencias de letra en todo el arreglo de los caracteres, solo comprobaria exactamente iguales.
        if (lenguaje[i].toLowerCase().includes(value)) {
            resultado[resultado.length] = lenguaje[i];
        }
    }

    return resultado;
}

buscar.addEventListener("input",
    // Funcion con el texto del input de texto
    function (input) {
        const filtro = busqueda(input.target.value);
        // Funcion pero solo con los resultados
        muestraCartas(filtro);
    }
);

// Llamada inicial
muestraCartas(lenguaje);
