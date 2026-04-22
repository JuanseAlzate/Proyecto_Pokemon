require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

const usuarioRutas = require('./src/rutas/rutasUsuario');
const capturaRutas = require('./src/rutas/rutasCapturado');

app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.use('/page2', express.static('public2'));

app.use('/api/usuarios', usuarioRutas);
app.use('/api/captura', capturaRutas);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
