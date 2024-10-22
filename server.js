const express = require('express');
const mysql = require('mysql');
const path = require('path');

const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;




// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'agus',
  database: 'inmobiliaria'
});

// Conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});
// Habilitar CORS para todas las rutas
app.use(cors())
app.use(bodyParser.json()); // Permitir analizar JSON en el cuerpo de las solicitudes

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = 'SELECT * FROM usuario WHERE usuario = ? AND contraseña = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error checking credentials:', err.stack);
      res.status(500).send('Error checking credentials');
      return;
    }

    if (results.length > 0) {
      res.json({ message: 'Usuario autenticado' });
    } else {
      res.status(401).send('Credenciales incorrectas');
    }
  });
});


// Ruta para obtener datos de la base de datos
app.get('/data', (req, res) => {
  const query = `
    SELECT 
      i.idinmueble, 
      i.localidad, 
      i.direccion, 
      CONCAT(p.apellido, ', ', p.nombre) AS propietario, 
      t.nombre AS tipo_inmueble, 
      e.nombre AS estado_inmueble
    FROM 
      inmueble i
    LEFT JOIN 
      cliente p ON i.propietario = p.idcliente
    LEFT JOIN 
      estadoinmueble e ON i.estado = e.idestadoinmueble
    LEFT JOIN 
      tipoinmueble t ON i.tipoinm = t.idtipoinmueble
    WHERE 
      i.anulado IS NULL;
  `
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err.stack);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

app.post('/inmuebles', (req, res) => {
  console.log('Datos recibidos:', req.body); // Muestra los datos en el servidor

  // Asume que los campos del body están bien nombrados
  const { idinmueble, localidad, direccion, propietario, tipo_inmueble, estado_inmueble } = req.body;

  const query = `
    INSERT INTO inmueble (idinmueble, localidad, direccion, propietario, tipoinm, estado) 
    VALUES (?, ?, ?, 
      (SELECT idcliente FROM cliente WHERE CONCAT(apellido, ', ', nombre) = ?), 
      (SELECT idtipoinmueble FROM tipoinmueble WHERE nombre = ?), 
      (SELECT idestadoinmueble FROM estadoinmueble WHERE nombre = ?)
    )`;

  connection.query(query, [idinmueble, localidad, direccion, propietario, tipo_inmueble, estado_inmueble], (err, results) => {
    if (err) {
      console.error('Error SQL al agregar inmueble:', err.message);  // Muestra el error detallado
      res.status(500).json({ error: 'Error adding inmueble', details: err.message });
      return;
    }
    res.json({ message: 'Inmueble added', id: results.insertId });
  });
});

app.put('/inmuebles/:id', (req, res) => {
  const { id } = req.params;
  const { idinmueble, localidad, direccion, propietario, tipo_inmueble, estado_inmueble } = req.body;
  
  const query = `
    UPDATE inmueble 
    SET 
      idinmueble = ?, 
      localidad = ?, 
      direccion = ?, 
      propietario = (SELECT idcliente FROM cliente WHERE CONCAT(apellido, ', ', nombre) = ?), 
      tipoinm = (SELECT idtipoinmueble FROM tipoinmueble WHERE nombre = ?), 
      estado = (SELECT idestadoinmueble FROM estadoinmueble WHERE nombre = ?) 
    WHERE idinmueble = ?`;

  connection.query(query, [idinmueble, localidad, direccion, propietario, tipo_inmueble, estado_inmueble, id], (err, results) => {
    if (err) {
      console.error('Error SQL al actualizar inmueble:', err.message); 
      res.status(500).json({ error: 'Error updating inmueble', details: err.message });
      return;
    }
    res.json({ message: 'Inmueble updated' });
  });
});


app.get('/inmuebles/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM inmueble WHERE idinmueble = ?';
  connection.query(query, [id], (err, results) => {
      if (err) {
          console.error('Error fetching inmueble:', err.stack);
          res.status(500).send('Error fetching inmueble');
          return;
      }
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.status(404).send('Inmueble not found');
      }
  });
});

app.use(express.static(path.join(__dirname, 'proyecto inmobiliaria')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Ruta para obtener datos de personas
app.get('/personas', (req, res) => {
  const query = 'SELECT idcliente, dni, apellido, nombre FROM cliente WHERE anulado IS NULL';
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data:', err.stack);
          res.status(500).send('Error fetching data');
          return;
      }
      res.json(results);
  });
});

app.post('/personas', (req, res) => {
  const { dni, apellido, nombre } = req.body;
  const query = 'INSERT INTO cliente (dni, apellido, nombre) VALUES (?, ?, ?)';
  connection.query(query, [dni, apellido, nombre], (err, results) => {
      if (err) {
          console.error('Error adding person:', err.stack);
          res.status(500).send('Error adding person');
          return;
      }
      res.json({ message: 'Person added', id: results.insertId });
  });
});

app.put('/personas/:id', (req, res) => {
  const { id } = req.params;
  const { dni, apellido, nombre } = req.body;
  const query = 'UPDATE cliente SET dni = ?, apellido = ?, nombre = ? WHERE idcliente = ?';
  connection.query(query, [dni, apellido, nombre, id], (err, results) => {
      if (err) {
          console.error('Error updating person:', err.stack);
          res.status(500).send('Error updating person');
          return;
      }
      res.json({ message: 'Person updated' });
  });
});

app.get('/personas/:id', (req, res) => {
  const { id } = req.params;
  const query =  `
  SELECT
    p.dni,
    p.apellido,
    p.nombre
  FROM
    inmobiliaria.cliente p
  WHERE
    p.idcliente = ?;
`;
  connection.query(query, [id, id], (err, results) => {
    if (err) {
      console.error('Error fetching person:', err.stack);
      res.status(500).send('Error fetching person');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Person not found');
      return;
    }
    res.json(results);
  });
});

// Ruta para obtener todos los contratos
app.get('/contratos', (req, res) => {
  const query = `
    SELECT 
      c.idcontrato, 
      CONCAT(p.apellido, ' , ', p.nombre) AS propietario, 
      CONCAT(i.apellido, ' , ', i.nombre) AS inquilino, 
      m.direccion, 
      DATE_FORMAT(c.fechavenc, '%d-%m-%Y') AS fechavenc
    FROM 
      contrato c 
    LEFT JOIN 
      inmueble m ON c.inmueble = m.idinmueble 
    LEFT JOIN 
      cliente p ON m.propietario = p.idcliente 
    LEFT JOIN 
      cliente i ON c.inquilino = i.idcliente
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching contracts:', err.stack);
      res.status(500).send('Error fetching contracts');
      return;
    }
    res.json(results);
  });
});

// Ruta para insertar un nuevo contrato
app.post('/contratos', (req, res) => {
  const { propietario, inquilino, direccion, fecha_fin } = req.body;
  
  if (!propietario || !inquilino || !direccion || !fecha_fin) {
    return res.status(400).send('Missing required fields');
  }

  const query = `
    INSERT INTO contrato (propietario, inquilino, direccion, fechavenc) 
    VALUES (?, ?, ?, ?)
  `;
  
  connection.query(query, [propietario, inquilino, direccion, fecha_fin], (err, results) => {
    if (err) {
      console.error('Error adding contract:', err.stack);
      res.status(500).send('Error adding contract');
      return;
    }
    res.json({ message: 'Contract added', id: results.insertId });
  });
});

// Ruta para actualizar un contrato existente
app.put('/contratos/:id', (req, res) => {
  const { id } = req.params;
  const { propietario, inquilino, direccion, fecha_fin } = req.body;
  
  if (!propietario || !inquilino || !direccion || !fecha_fin) {
    return res.status(400).send('Missing required fields');
  }

  const query = `
    UPDATE contrato 
    SET propietario = ?, inquilino = ?, direccion = ?, fechavenc = ? 
    WHERE idcontrato = ?
  `;
  
  connection.query(query, [propietario, inquilino, direccion, fecha_fin, id], (err, results) => {
    if (err) {
      console.error('Error updating contract:', err.stack);
      res.status(500).send('Error updating contract');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send('Contract not found');
      return;
    }
    res.json({ message: 'Contract updated' });
  });
});

// Ruta para obtener un contrato específico por ID
app.get('/contratos/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      c.idcontrato, 
      CONCAT(p.apellido, ' , ', p.nombre) AS propietario, 
      CONCAT(i.apellido, ' , ', i.nombre) AS inquilino, 
      m.direccion, 
      DATE_FORMAT(c.fechavenc, '%d-%m-%Y') AS fechavenc 
    FROM 
      contrato c 
    LEFT JOIN 
      inmueble m ON c.inmueble = m.idinmueble 
    LEFT JOIN 
      cliente p ON m.propietario = p.idcliente 
    LEFT JOIN 
      cliente i ON c.inquilino = i.idcliente
    WHERE c.idcontrato = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching contract:', err.stack);
      res.status(500).send('Error fetching contract');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Contract not found');
      return;
    }
    res.json(results[0]); // Retorna el primer contrato encontrado
  });
});
