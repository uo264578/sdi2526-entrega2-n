const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const empleadoRoutes = require('./routes/empleado');
const logsRepository = require('./modules/logsRepository');
const apiAuthRoutes = require('./routes/api/auth');
const apiVehiculosRoutes = require('./routes/api/vehiculos');
const apiTrayectos = require('./routes/api/trayectos');

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
app.use('/', adminRoutes);
app.use('/', empleadoRoutes);
app.use('/api/auth', apiAuthRoutes);
app.use('/api/vehiculos', apiVehiculosRoutes);
app.use('/api', apiTrayectos);

module.exports = app;
