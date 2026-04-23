const API = 'http://localhost:3000/api';

let todosPokemon = [];

document.addEventListener('DOMContentLoaded', () => {
  cargarPokemon();

  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', filtrarPokemon);
  }
});

function mostrarToast(msg) {
  const toast = new bootstrap.Toast(document.getElementById('toast'));
  document.getElementById('toastMsg').textContent = msg;
  toast.show();
}

/* -------- NAVEGACIÓN DE SECCIONES -------- */

function mostrarSeccion(seccion) {
  document
    .querySelectorAll('.seccion-contenedor')
    .forEach((s) => s.classList.add('d-none'));
  document.getElementById('heroSection').classList.add('d-none');

  const seccionId = `seccion-${seccion}`;
  const elemento = document.getElementById(seccionId);
  if (elemento) {
    elemento.classList.remove('d-none');
  }

  window.scrollTo(0, 0);
}

function volverAlMenu() {
  document
    .querySelectorAll('.seccion-contenedor')
    .forEach((s) => s.classList.add('d-none'));

  document.getElementById('heroSection').classList.remove('d-none');
  window.scrollTo(0, 0);
}

/* ------------ USUARIOS --------------- */

async function crearUsuario() {
  const cedula = document.getElementById('cedula').value;
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const edad = document.getElementById('edad').value;

  if (!cedula || !nombre) {
    mostrarToast('Completa los campos obligatorios');
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula,
        nombre,
        email,
        edad,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarToast(data.mensaje);
      return;
    }

    mostrarToast('¡Usuario registrado exitosamente!');
    document.getElementById('cedula').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    document.getElementById('edad').value = '';
  } catch {
    mostrarToast('Error al registrar usuario');
  }
}

async function actualizarUsuario() {
  const cedula = document.getElementById('cedulaActualizar').value;
  const nombre = document.getElementById('nombreActualizar').value;
  const email = document.getElementById('emailActualizar').value;
  const edad = document.getElementById('edadActualizar').value;

  if (!cedula) {
    mostrarToast('Ingresa la cédula del usuario a actualizar');
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/actualizar/${cedula}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre || undefined,
        email: email || undefined,
        edad: edad || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarToast(data.mensaje);
      return;
    }

    mostrarToast('¡Usuario actualizado exitosamente!');
    document.getElementById('cedulaActualizar').value = '';
    document.getElementById('nombreActualizar').value = '';
    document.getElementById('emailActualizar').value = '';
    document.getElementById('edadActualizar').value = '';
  } catch {
    mostrarToast('Error al actualizar usuario');
  }
}

async function eliminarUsuario() {
  const cedula = document.getElementById('cedulaEliminar').value;

  if (!cedula) {
    mostrarToast('Ingresa la cédula a eliminar');
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/borrar/${cedula}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    mostrarToast(data.mensaje);

    if (res.ok) {
      document.getElementById('cedulaEliminar').value = '';
    }
  } catch {
    mostrarToast('Error al eliminar usuario');
  }
}

async function cargarUsuariosPanel() {
  try {
    const res = await fetch(`${API}/usuarios/listar`);
    const data = await res.json();

    if (!res.ok) {
      mostrarToast(data.mensaje || 'Error cargando usuarios');
      return;
    }

    const listaDeUsuarios = document.getElementById('listaDeUsuarios');
    const usuarios = Array.isArray(data.resultado) ? data.resultado : [];

    listaDeUsuarios.innerHTML = '';

    if (usuarios.length === 0) {
      listaDeUsuarios.innerHTML =
        '<li class="list-group-item text-center text-muted">No hay usuarios registrados</li>';
    } else {
      usuarios.forEach((u) => {
        listaDeUsuarios.innerHTML += `
          <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>Nombre: ${u.nombre}</strong><br>
                <small>Cédula: ${u.cedula}</small><br>
                <small>Email: ${u.email || 'Sin correo'}</small><br>
                <small>Edad: ${u.edad} años</small>
              </div>
            </div>
          </li>
        `;
      });
    }

    new bootstrap.Modal(document.getElementById('usuariosModal')).show();
  } catch {
    mostrarToast('Error cargando usuarios');
  }
}

/* --------- POKEMON ---------- */

async function cargarPokemon() {
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=200');
    const data = await res.json();

    const detalles = await Promise.all(
      data.results.map((p) =>
        fetch(p.url).then((pokemonRes) => pokemonRes.json()),
      ),
    );

    todosPokemon = detalles;
    renderPokemon(todosPokemon);
    actualizarSelectPokemon();
  } catch (e) {
    console.error('Error cargando Pokémon:', e);
  }
}

function renderPokemon(lista) {
  const listaPokemon = document.getElementById('listaPokemon');
  if (!listaPokemon) return;

  listaPokemon.innerHTML = '';

  lista.forEach((poke) => {
    const tipo = poke.types[0]?.type?.name?.toUpperCase() || 'NORMAL';
    listaPokemon.innerHTML += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="pokemon-card pokemon-item" onclick="verPokemon(${poke.id})" style="cursor: pointer;">
          <div class="text-center pokemon-img-container">
            <img src="${poke.sprites.front_default}" alt="${poke.name}">
          </div>
          <div class="pokemon-info p-2 text-center">
            <p class="fw-bold mb-1">${poke.name.toUpperCase()}</p>
            <small class="text-muted">Tipo: ${tipo}</small><br>
            <small class="text-muted">Poder: ${poke.base_experience}</small>
          </div>
        </div>
      </div>
    `;
  });
}

function actualizarSelectPokemon() {
  const pokemonSelect = document.getElementById('pokemonSelect');
  if (!pokemonSelect) return;

  pokemonSelect.innerHTML =
    '<option selected disabled>⬇️ Selecciona un pokémon</option>';
  pokemonSelect.innerHTML += todosPokemon
    .map((p) => `<option value="${p.name}">${p.name.toUpperCase()}</option>`)
    .join('');
}

function filtrarPokemon(e) {
  const texto = e.target.value.toLowerCase();

  if (texto === '') {
    renderPokemon(todosPokemon);
    return;
  }

  renderPokemon(
    todosPokemon.filter((p) => p.name.toLowerCase().includes(texto)),
  );
}

/* ----------- CAPTURAS ----------- */

async function capturarPokemon() {
  const usuarioSelect = document.getElementById('usuarioSelect');
  const pokemonSelect = document.getElementById('pokemonSelect');

  if (!usuarioSelect.value) return mostrarToast('Ingresa cédula del usuario');
  if (!pokemonSelect.value) return mostrarToast('Selecciona un pokémon');

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

    mostrarToast('¡Pokémon capturado exitosamente!');
    pokemonSelect.value = '⬇️ Selecciona un pokémon';
  } catch {
    mostrarToast('Error al capturar');
  }
}

async function cargarCapturasPanel() {
  const usuarioSelect = document.getElementById('usuarioSelect');

  if (!usuarioSelect.value) return mostrarToast('Ingresa cédula del usuario');

  try {
    const res = await fetch(`${API}/captura/listar/${usuarioSelect.value}`);
    const data = await res.json();

    const listaCapturasPanel = document.getElementById('listaCapturasPanel');
    listaCapturasPanel.innerHTML = '';

    if (data.resultado && data.resultado.length > 0) {
      data.resultado.forEach((c) => {
        const poke = todosPokemon.find((p) => p.id === c.pokemonId);

        listaCapturasPanel.innerHTML += `
          <li class="list-group-item d-flex gap-2 align-items-center">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${c.pokemonId}.png" width="50" style="background: rgba(0,0,0,0.05); padding: 5px; border-radius: 5px;">
            <div>
              <strong>${poke ? poke.name.toUpperCase() : 'Desconocido'}</strong><br>
              <small>Tipo: ${poke ? (poke.types[0]?.type?.name || 'Normal').toUpperCase() : 'Desconocido'}</small>
              <small class="text-muted">Poder: ${poke ? poke.base_experience : 'Desconocido'}</small>
            </div>
          </li>
        `;
      });
    } else {
      listaCapturasPanel.innerHTML =
        '<li class="list-group-item text-center text-muted">Este usuario aún no ha capturado pokémons</li>';
    }

    const modal = new bootstrap.Modal(document.getElementById('capturasModal'));
    modal.show();
  } catch {
    mostrarToast('Error cargando colección');
  }
}

/* -------- MODAL POKÉMON -------- */

function verPokemon(id) {
  const poke = todosPokemon.find((p) => p.id === id);

  if (!poke) {
    mostrarToast('Pokémon no encontrado');
    return;
  }

  document.getElementById('pokemonNombre').textContent =
    poke.name.toUpperCase();
  document.getElementById('pokemonImg').src = poke.sprites.front_default;
  document.getElementById('pokemonTipo').textContent =
    'Tipo: ' +
    poke.types
      .map((t) => t.type.name)
      .join(', ')
      .toUpperCase();
  document.getElementById('pokemonPoder').textContent =
    'Experiencia base: ' + poke.base_experience;

  new bootstrap.Modal(document.getElementById('pokemonModal')).show();
}
