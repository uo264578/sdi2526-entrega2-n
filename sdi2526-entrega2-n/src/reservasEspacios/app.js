const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');
const empleadoRoutes = require('./routes/empleado');
const logsRepository = require('./modules/logsRepository');
const apiAuthRoutes = require('./routes/api/auth');
const espaciosRoutes = require('./routes/espacios');
const reservasAdminRoutes = require('./routes/reservasAdmin');
const espaciosAdminRoutes = require('./routes/espaciosAdmin');
const bloqueosAdminRoutes = require('./routes/bloqueosAdmin');
const reservasRoutes = require('./routes/reservas');
const passwordRoutes = require('./routes/password');
const usuariosAdminRoutes = require('./routes/usuariosAdmin');



const log4js = require('log4js');

const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'clave_secreta_flota',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

log4js.configure({
  appenders: { app: { type: "file", filename: "logs/app.log" } },
  categories: { default: { appenders: ["app"], level: "info" } }
});

app.use(async (req, res, next) => {
  let safeBody = { ...req.body };
  if (safeBody.password) {
    safeBody.password = "***";
  }

  await logsRepository.insertarLog({
    tipo: "PET",
    fechaHora: new Date(),
    texto: `Petición: ${req.method} ${req.url} | Body: ${JSON.stringify(safeBody)}`
  });

  next();
});



app.use('/', authRoutes);
//app.use('/', adminRoutes);
app.use('/', empleadoRoutes);
app.use('/', espaciosRoutes);
app.use('/', reservasAdminRoutes);
app.use('/', reservasRoutes);
app.use('/', espaciosAdminRoutes);
app.use('/', bloqueosAdminRoutes);
app.use('/', passwordRoutes);
app.use('/', usuariosAdminRoutes);

module.exports = app;
