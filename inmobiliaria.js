// inmobiliaria.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginform');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
      
        console.log('Sección de login oculta, sección de presentación mostrada');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                mode: 'cors' // Configurar modo CORS
            });

            if (response.status === 401) {
                // Si recibimos un error 401 (Unauthorized), mostrar un mensaje de error
                throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
            }
            
            if (!response.ok) {
                console.log('No Ok');
                if (response.status === 401) {
                    throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.'); // Error específico para credenciales incorrectas
                } else {
                    throw new Error('Error en la solicitud: ' + response.statusText); // Otro tipo de error genérico
                }
            }
            else{
                console.log('Ok');
            }

            const data = await response.json();
            console.log('Usuario autenticado:', data);

            // Redirigir a la página principal después de iniciar sesión
            document.getElementById('login').style.display = 'none';
            document.getElementById('presentacion').style.display = 'block';
            document.getElementById('navbar').classList.remove('hidden');
        } catch (error) {
            //console.error('Error:', error.message);
            alert(error.message);
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Usuario o contraseña incorrectos';
        }
    });
    // Cargar los datos iniciales de inmuebles
    fetchData();

   // Formulario para agregar inmuebles
   const inmuebleForm = document.getElementById('inmuebleForm');
   inmuebleForm.addEventListener('submit', handleFormSubmit);

   // Formulario para editar inmuebles
   const editInmuebleForm = document.getElementById('editInmuebleForm');
   editInmuebleForm.addEventListener('submit', handleEditFormSubmit);
   
   fetchContractData();

   // Formulario para agregar contratos
   const contractForm = document.getElementById('contractForm');
   contractForm.addEventListener('submit', handleContractFormSubmit);

   // Formulario para editar contratos
   const editContractForm = document.getElementById('editContractForm');
   editContractForm.addEventListener('submit', handleEditContractFormSubmit);
});
 
function fetchData() {
fetch('http://localhost:3000/data')
      .then(response => response.json())
      .then(data => {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Limpiar el contenido previo
        data.forEach(row => {
          const tr = document.createElement('tr');
          // Ajusta las propiedades según los campos de tu tabla
          tr.innerHTML = `
            <td>${row.inmueble}</td>
            <td>${row.localidad}</td>
            <td>${row.direccion}</td>
            <td>${row.propietario}</td>
            <td>${row.tipo_inmueble}</td>
            <td>${row.estado_inmueble}</td>
            <!-- ...otros campos -->
            <td>
                        <button onclick="editInmueble(${row.idinmueble})">Editar</button>
                    </td>
          `;
          tableBody.appendChild(tr);
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  
}
function showAddForm() {
    document.getElementById('inmuebleModal').classList.remove('hidden');
    document.getElementById('inmuebleForm').reset();
    document.getElementById('inmuebleId').value = '';
}

function hideAddForm() {
    document.getElementById('inmuebleModal').classList.add('hidden');
}
function showEditForm() {
    document.getElementById('editInmuebleModal').classList.remove('hidden');
}

function hideEditForm() {
    document.getElementById('editInmuebleModal').classList.add('hidden');
}

function editInmueble(id) {
    fetch(`http://localhost:3000/inmuebles/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editInmuebleId').value = data.idinmueble;
            document.getElementById('editInmueble').value = data.inmueble;
            document.getElementById('editLocalidad').value = data.localidad;
            document.getElementById('editDireccion').value = data.direccion;
            document.getElementById('editPropietario').value = data.propietario;
            document.getElementById('editTipoInmueble').value = data.tipo_inmueble;
            document.getElementById('editEstadoInmueble').value = data.estado;

            showEditForm();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('inmuebleId').value;
    const inmueble = document.getElementById('inmueble').value;
    const localidad = document.getElementById('localidad').value;
    const direccion = document.getElementById('direccion').value;
    const propietario = document.getElementById('propietario').value;
    const tipoInmueble = document.getElementById('tipoInmueble').value;
    const estadoInmueble = document.getElementById('estadoInmueble').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/inmuebles/${id}` : 'http://localhost:3000/inmuebles';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            idinmueble: inmueble, 
            localidad, 
            direccion, 
            propietario, 
            tipo_inmueble: tipoInmueble, 
            estado_inmueble: estadoInmueble 
          })
    })
    .then(response => {
        if (!response.ok) {
            // Si el servidor devuelve un error, no intentamos hacer .json() directamente
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(() => {
        hideAddForm();
        fetchData();
    })
    .catch(error => console.error('Error submitting form:', error));
}
function handleEditFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('editInmuebleId').value;
    const inmueble = document.getElementById('editInmueble').value;
    const localidad = document.getElementById('editLocalidad').value;
    const direccion = document.getElementById('editDireccion').value;
    const propietario = document.getElementById('editPropietario').value;
    const tipoInmueble = document.getElementById('editTipoInmueble').value;
    const estadoInmueble = document.getElementById('editEstadoInmueble').value;

    const url = `http://localhost:3000/inmuebles/${id}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idinmueble: inmueble, localidad, direccion, propietario, tipo_inmueble: tipoInmueble, estado_inmueble: estadoInmueble })
    })
    .then(response => response.json())
    .then(() => {
        hideEditForm();
        fetchData();
    })
    .catch(error => console.error('Error submitting form:', error));
}


function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'listaInmuebles') {
        fetchData();
    }
}
function sectionPersona(sectionP) {
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionP).style.display = 'block';

    if (sectionP === 'listaPersonas') {
        fetchData();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Código existente...

    // Cargar los datos iniciales de personas
    fetchPersonData();

    // Formulario para agregar personas
    const personForm = document.getElementById('personForm');
    personForm.addEventListener('submit', handlePersonFormSubmit);

    // Formulario para editar personas
    const editPersonForm = document.getElementById('editPersonForm');
    editPersonForm.addEventListener('submit', handleEditPersonFormSubmit);
});

function fetchPersonData() {
    fetch('http://localhost:3000/personas')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#personas-table tbody');
            tableBody.innerHTML = ''; // Limpiar el contenido previo
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.dni}</td>
                    <td>${row.apellido}</td>
                    <td>${row.nombre}</td>
                    <td>
                        <button onclick="editPerson(${row.idcliente})">Editar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function showAddPersonForm() {
    document.getElementById('personModal').classList.remove('hidden');
    document.getElementById('personForm').reset();
    document.getElementById('personId').value = '';
}

function hideAddPersonForm() {
    document.getElementById('personModal').classList.add('hidden');
}

function showEditPersonForm() {
    document.getElementById('editPersonModal').classList.remove('hidden');
}

function hideEditPersonForm() {
    document.getElementById('editPersonModal').classList.add('hidden');
}

function editPerson(id) {
    fetch(`http://localhost:3000/personas/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editPersonId').value = data.idcliente;
            document.getElementById('editDni').value = data.dni;
            document.getElementById('editApellido').value = data.apellido;
            document.getElementById('editNombre').value = data.nombre;

            showEditPersonForm();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function handlePersonFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('personId').value;
    const dni = document.getElementById('dni').value;
    const apellido = document.getElementById('apellido').value;
    const nombre = document.getElementById('nombre').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/personas/${id}` : 'http://localhost:3000/personas';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dni, apellido, nombre })
    })
    .then(response => response.json())
    .then(() => {
        hideAddPersonForm();
        fetchPersonData();
    })
    .catch(error => console.error('Error submitting form:', error));
}

function handleEditPersonFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('editPersonId').value;
    const dni = document.getElementById('editDni').value;
    const apellido = document.getElementById('editApellido').value;
    const nombre = document.getElementById('editNombre').value;

    const url = `http://localhost:3000/personas/${id}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dni, apellido, nombre })
    })
    .then(response => response.json())
    .then(() => {
        hideEditPersonForm();
        fetchPersonData();
    })
    .catch(error => console.error('Error submitting form:', error));
}
function fetchContractData() {
    fetch('http://localhost:3000/contratos')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#contratos-table tbody');
            tableBody.innerHTML = ''; // Limpiar el contenido previo
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.idcontrato}</td>
                    <td>${row.propietario}</td>
                    <td>${row.inquilino}</td>
                    <td>${row.direccion}</td>
                    <td>${row.fechavenc}</td>
                    <td>
                        <button onclick="editContract(${row.idcontrato})">Editar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            debugger
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please try again later.');
        });
}
function showAddContractForm() {
    document.getElementById('contractModal').classList.remove('hidden');
    document.getElementById('contractForm').reset();
    document.getElementById('contractId').value = '';
}

function hideAddContractForm() {
    document.getElementById('contractModal').classList.add('hidden');
}

function showEditContractForm() {
    document.getElementById('editContractModal').classList.remove('hidden');
}

function hideEditContractForm() {
    document.getElementById('editContractModal').classList.add('hidden');
}

function editContract(id) {
    fetch(`http://localhost:3000/contratos/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editContractId').value = data.idcontrato;
            document.getElementById('editPropietario').value = data.propietario;
            document.getElementById('editInquilino').value = data.inquilino;
            document.getElementById('editDireccion').value = data.direccion;
            document.getElementById('editFechaFin').value = data.fecha_fin;

            showEditContractForm();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function handleContractFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('contractId').value;
    const propietario = document.getElementById('propietario').value;
    const inquilino = document.getElementById('inquilino').value;
    const direccion = document.getElementById('direccion').value;
    const fecha_fin = document.getElementById('fechaFin').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/contratos/${id}` : 'http://localhost:3000/contratos';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ propietario, inquilino, direccion, fecha_fin })
    })
    .then(response => response.json())
    .then(() => {
        hideAddContractForm();
        fetchContractData();
    })
    .catch(error => console.error('Error submitting form:', error));
}

function handleEditContractFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('editContractId').value;
    const propietario = document.getElementById('editPropietario').value;
    const inquilino = document.getElementById('editInquilino').value;
    const direccion = document.getElementById('editDireccion').value;
    const fecha_fin = document.getElementById('editFechaFin').value;

    const url = `http://localhost:3000/contratos/${id}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ propietario, inquilino, direccion, fecha_fin })
    })
    .then(response => response.json())
    .then(() => {
        hideEditContractForm();
        fetchContractData();
    })
    .catch(error => console.error('Error submitting form:', error));
}