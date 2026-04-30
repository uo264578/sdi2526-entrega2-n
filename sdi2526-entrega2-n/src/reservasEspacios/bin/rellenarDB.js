const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function poblarBaseDeDatos() {
    try {
        await client.connect();
        const db = client.db('reservasDB');

        await db.collection('usuarios').deleteMany({});

        await db.collection('usuarios').insertOne({
            dni: "12345678Z",
            nombre: "Administrador",
            apellidos: "Principal",
            correo: "admin@empresa.com",
            password: crypto.createHmac('sha256', 'uo264578').update('@Dm1n1str@D0r').digest('hex'),
            rol: "Administrador"
        });

        let empleados = [];
        for (let i = 1; i <= 15; i++) {
            empleados.push({
                dni: "1000000" + i + (i % 2 === 0 ? "Q" : "S"),
                nombre: "Empleado" + i,
                apellidos: "Apellido" + i,
                correo: `empleado${i}@empresa.com`,
                password: crypto.createHmac('sha256', 'uo264578').update(`Us3r@${i}-PASSW`).digest('hex'),
                rol: "Usuario Estándar"
            });
        }
        await db.collection('usuarios').insertMany(empleados);

        let vehiculos = [];
        for (let i = 1; i <= 6; i++) {
            vehiculos.push({
                matricula: `${1000 + i}ABC`,
                bastidor: `VINCODE123456789${i}`,
                marca: "Marca" + i,
                modelo: "Modelo" + i,
                combustible: "Gasolina",
                estado: "LIBRE"
            });
        }

        console.log('✅ Base de datos poblada correctamente con correos añadidos.');
    } finally {
        await client.close();
    }
}

poblarBaseDeDatos().catch(console.error);
