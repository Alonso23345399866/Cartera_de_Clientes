let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

const menu = document.getElementById('menu');
const registro = document.getElementById('registro');
const busqueda = document.getElementById('busqueda');
const tabla = document.getElementById('tabla');
const filtro = document.getElementById('filtro');
const clienteForm = document.getElementById('clienteForm');

function mostrarRegistro() {
  menu.style.display = 'none';
  registro.style.display = 'block';
}

function mostrarBusqueda() {
  menu.style.display = 'none';
  busqueda.style.display = 'block';
  mostrar(clientes);
}

function volverMenu() {
  registro.style.display = 'none';
  busqueda.style.display = 'none';
  menu.style.display = 'block';
}

function importarExcel() {
  const fileInput = document.getElementById('excelFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Selecciona un archivo primero');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    // 👇 Convertimos a matriz
    const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 });

    console.log("FILAS EXCEL:", filas); // 🔥 DEBUG

    let importados = 0;

    filas.forEach((row, index) => {
      // Saltar filas vacías
      if (!row || row.length < 2) return;

      const nombre = (row[1] || '').toString().trim();
      const dni = (row[2] || '').toString().trim();
      const localidad = (row[3] || '').toString().trim();
      const direccion = (row[4] || '').toString().trim();
      const contacto = (row[5] || '').toString().trim();
      const transporte = (row[6] || '').toString().trim();
      const celular = (row[7] || '').toString().trim();

      // Saltar encabezados o basura
      if (dni.toLowerCase().includes('dni')) return;

      if (!dni) return;

      if (!clientes.some(c => c.dni === dni)) {
        clientes.push({
          nombre,
          dni,
          localidad,
          direccion,
          contacto,
          transporte,
          celular
        });
        importados++;
      }
    });

    guardarLocalStorage();
    alert(`Se importaron ${importados} clientes`);
  };

  reader.readAsArrayBuffer(file);
}

function guardarLocalStorage() {
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

// 🔥 FUNCIÓN PRINCIPAL (CON BOTÓN BASURERO)
function mostrar(lista) {
  tabla.innerHTML = '';

  if (lista.length === 0) {
    tabla.innerHTML = `<tr><td colspan="8">No hay clientes registrados</td></tr>`;
    return;
  }

  lista.forEach(c => {
    tabla.innerHTML += `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.dni}</td>
        <td>${c.localidad}</td>
        <td>${c.direccion}</td>
        <td>${c.contacto}</td>
        <td>${c.transporte}</td>
        <td>${c.celular}</td>
        <td>
          <button onclick="eliminarCliente('${c.dni}')" class="btn-eliminar">🗑️</button>
        </td>
      </tr>
    `;
  });
}

// 🗑️ ELIMINAR
function eliminarCliente(dni) {
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;

  const dniLimpio = dni.toString().trim();

  clientes = clientes.filter(c => c.dni !== dni);
  guardarLocalStorage();
  mostrar(clientes);
}

// REGISTRAR
clienteForm.addEventListener('submit', e => {
  e.preventDefault();

  const nombreVal = nombre.value.trim();
  const dni = dniRuc.value.trim();
  const localidadVal = localidad.value.trim();
  const direccionVal = direccion.value.trim();
  const contactoVal = contacto.value.trim();
  const transporteVal = transporte.value.trim();
  const celularVal = celular.value.trim();

  if (!/^\d{8}$/.test(dni) && !/^\d{11}$/.test(dni)) {
    alert('El DNI debe tener 8 dígitos o el RUC 11');
    return;
  }

  if (clientes.some(c => c.dni === dni)) {
    alert('El DNI/RUC ya está registrado');
    return;
  }

  clientes.push({
    dni,
    nombre: nombreVal,
    localidad: localidadVal,
    direccion: direccionVal,
    contacto: contactoVal,
    transporte: transporteVal,
    celular: celularVal
  });

  guardarLocalStorage();
  clienteForm.reset();
  alert('Cliente registrado correctamente');
});

// 🔍 FILTRO POR NOMBRE (CORREGIDO)
filtro.addEventListener('input', () => {
  const texto = filtro.value.toLowerCase();
  mostrar(clientes.filter(c => c.nombre.toLowerCase().includes(texto)));
});