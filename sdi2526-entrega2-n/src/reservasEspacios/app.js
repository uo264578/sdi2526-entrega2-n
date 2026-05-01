const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const empleadoRoutes = require('./routes/empleado');
const espaciosRoutes = require('./routes/espacios');
const reservasAdminRoutes = require('./routes/reservasAdmin');
const espaciosAdminRoutes = require('./routes/espaciosAdmin');
const bloqueosAdminRoutes = require('./routes/bloqueosAdmin');
const reservasRoutes = require('./routes/reservas');
const passwordRoutes = require('./routes/password');
const usuariosAdminRoutes = require('./routes/usuariosAdmin');

const apiAuthRoutes = require('./routes/api/apiAuth');
const apiReservasRoutes = require('./routes/api/apiReservas');

const app = express();
const cors = require('cors');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'clave_secreta_reservas',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use('/', authRoutes);
app.use('/', empleadoRoutes);
app.use('/', espaciosRoutes);
app.use('/', reservasAdminRoutes);
app.use('/', reservasRoutes);
app.use('/', espaciosAdminRoutes);
app.use('/', bloqueosAdminRoutes);
app.use('/', passwordRoutes);
app.use('/', usuariosAdminRoutes);

app.use('/', apiAuthRoutes);
app.use('/', apiReservasRoutes);

module.exports = app;