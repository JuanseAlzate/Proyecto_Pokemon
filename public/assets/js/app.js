const API = 'http://localhost:3000/api';

let todosPokemon = [];
let mostrandoTodos = false;

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  cargarPokemon();

  buscador.addEventListener('input', filtrarPokemon);
});

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem(
    'darkMode',
    document.body.classList.contains('dark-mode'),
  );
}

function mostrarToast(msg) {
  const toast = new bootstrap.Toast(document.getElementById('toast'));
  toastMsg.textContent = msg;
  toast.show();
}

/* ---------------- USUARIOS ---------------- */

async function crearUsuario() {
  if (!cedula.value || !nombre.value) {
    mostrarToast('Completa los campos');
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: cedula.value,
        nombre: nombre.value,
        email: email.value,
        edad: edad.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarToast(data.mensaje);
      return;
    }

    console.log('Entre aca');
    mostrarToast('Usuario creado');
    cargarUsuariosPanel();
  } catch {
    mostrarToast('Error servidor');
  }
}

async function actualizarUsuario() {
  if (!cedula.value) return mostrarToast('Ingresa cédula');

  try {
    const res = await fetch(`${API}/usuarios/actualizar/${cedula.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        edad: edad.value,
      }),
    });

    const data = await res.json();
    mostrarToast(data.mensaje);
  } catch {
    mostrarToast('Error al actualizar');
  }
}

async function eliminarUsuario() {
  if (!cedula.value) return mostrarToast('Ingresa cédula');

  try {
    const res = await fetch(`${API}/usuarios/borrar/${cedula.value}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    mostrarToast(data.mensaje);
  } catch {
    mostrarToast('Error al eliminar');
  }
}

async function cargarUsuariosPanel() {
  try {
    const res = await fetch(`${API}/usuarios/listar`);
    const data = await res.json();

    listaDeUsuarios.innerHTML = '';

    data.resultado.forEach((u) => {
      listaDeUsuarios.innerHTML += `
        <li class="list-group-item">
          <strong>Nombre: ${u.nombre}</strong><br>
          <small>Correo: ${u.email}</small><br>
          <small>Edad: ${u.edad} años</small>
        </li>
      `;
    });
  } catch {
    mostrarToast('Error cargando panel');
  }
}

/* ---------------- POKEMON ---------------- */

async function cargarPokemon() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
  const data = await res.json();

  const detalles = await Promise.all(
    data.results.map((p) => fetch(p.url).then((res) => res.json())),
  );

  todosPokemon = detalles;

  renderPokemon(todosPokemon.slice(0, 4));
}

function renderPokemon(lista) {
  listaPokemon.innerHTML = '';

  lista.forEach((poke) => {
    listaPokemon.innerHTML += `
      <div class="col-6 text-center" onclick="verPokemon(${poke.id})">
        <img src="${poke.sprites.front_default}">
        <p>${poke.name}</p>
      </div>
    `;
  });

  pokemonSelect.innerHTML = todosPokemon
    .map((p) => `<option>${p.name}</option>`)
    .join('');
}

function renderPokemonFull() {
  listaPokemonFull.innerHTML = '';

  todosPokemon.forEach((poke) => {
    listaPokemonFull.innerHTML += `
      <div class="col-md-2 text-center" onclick="verPokemon(${poke.id})">
        <img src="${poke.sprites.front_default}">
        <p>${poke.name}</p>
      </div>
    `;
  });
}

function verMasPokemon() {
  mostrandoTodos = !mostrandoTodos;

  if (mostrandoTodos) {
    colPokemon.classList.add('d-none');

    colUsuarios.classList.remove('col-md-4');
    colCaptura.classList.remove('col-md-4');

    colUsuarios.classList.add('col-md-6');
    colCaptura.classList.add('col-md-6');

    panelExtra.classList.remove('d-none');
    renderPokemonFull();

    btnToggle.textContent = 'Ver menos';
  } else {
    colPokemon.classList.remove('d-none');

    colUsuarios.classList.remove('col-md-6');
    colCaptura.classList.remove('col-md-6');

    colUsuarios.classList.add('col-md-4');
    colCaptura.classList.add('col-md-4');

    panelExtra.classList.add('d-none');

    btnToggle.textContent = 'Ver más';
  }
}

function filtrarPokemon(e) {
  const texto = e.target.value.toLowerCase();

  if (texto === '') {
    renderPokemon(todosPokemon.slice(0, 4));
    return;
  }

  renderPokemon(
    todosPokemon.filter((p) => p.name.toLowerCase().includes(texto)),
  );
}

/* ---------------- CAPTURAS ---------------- */

async function capturarPokemon() {
  if (!usuarioSelect.value) return mostrarToast('Ingresa cédula');

  const nombre = pokemonSelect.value;
  const poke = todosPokemon.find((p) => p.name === nombre);

  if (!poke) {
    mostrarToast('Pokémon no encontrado');
    return;
  }

  try {
    const res = await fetch(`${API}/captura/capturar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioCedula: usuarioSelect.value,
        pokemonId: poke.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarToast(data.mensaje);
      return;
    }

    mostrarToast('Capturado');
    cargarCapturas();
  } catch {
    mostrarToast('Error al capturar');
  }
}

async function cargarCapturasPanel() {
  if (!usuarioSelect.value) return mostrarToast('Ingresa cédula');

  try {
    const res = await fetch(`${API}/captura/listar/${usuarioSelect.value}`);
    const data = await res.json();

    listaCapturasPanel.innerHTML = '';

    data.resultado.forEach((c) => {
      const poke = todosPokemon.find((p) => p.id === c.pokemonId);

      listaCapturasPanel.innerHTML += `
        <li class="list-group-item d-flex gap-2 align-items-center">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${c.pokemonId}.png" width="40">
          <div>
            <strong>Nombre: ${poke ? poke.name : 'Desconocido'}</strong><br>
            <small>ID: ${c.pokemonId}</small>
          </div>
        </li>
      `;
    });

    const modal = new bootstrap.Modal(document.getElementById('capturasModal'));
    modal.show();
  } catch {
    mostrarToast('Error cargando panel de capturas');
  }
}

/* ---------------- MODAL ---------------- */

function verPokemon(id) {
  const poke = todosPokemon.find((p) => p.id === id);

  pokemonNombre.textContent = poke.name;
  pokemonImg.src = poke.sprites.front_default;
  pokemonTipo.textContent =
    'Tipo: ' + poke.types.map((t) => t.type.name).join(', ');
  pokemonPoder.textContent = 'Poder: ' + poke.base_experience;

  new bootstrap.Modal(pokemonModal).show();
}
