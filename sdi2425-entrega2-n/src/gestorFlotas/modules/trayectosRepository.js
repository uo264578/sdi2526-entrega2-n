const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "flotasDB";

module.exports = {
    findTrayectosByDni: async (dni) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').find({ dniEmpleado: dni }).sort({ fechaInicio: -1 }).toArray();
    },

    findVehiculosLibres: async () => {
        await client.connect();
        const db = client.db(dbName);
        const enCurso = await db.collection('trayectos').find({ fechaFin: null }).toArray();
        const matriculasEnUso = enCurso.map(t => t.matriculaVehiculo);
        return db.collection('vehiculos').find({ matricula: { $nin: matriculasEnUso } }).toArray();
    },

    findTrayectoEnCursoByEmpleado: async (dni) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').findOne({ dniEmpleado: dni, fechaFin: null });
    },

    findTrayectoEnCursoByVehiculo: async (matricula) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').findOne({ matriculaVehiculo: matricula, fechaFin: null });
    },

    findUltimoTrayectoVehiculo: async (matricula) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').find({ matriculaVehiculo: matricula, fechaFin: { $ne: null } }).sort({ fechaFin: -1 }).limit(1).next();
    },

    iniciarNuevoTrayecto: async (trayecto) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').insertOne(trayecto);
    },

    finalizarTrayecto: async (id, datosFinalizacion) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').updateOne(
            { _id: new ObjectId(id) },
            { $set: datosFinalizacion }
        );
    },

    findTrayectosByVehiculo: async (matricula) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').find({ matriculaVehiculo: matricula }).sort({ fechaInicio: -1 }).toArray();
    },

    findAllVehiculos: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('vehiculos').find({}).toArray();
    },
    findTrayectoById: async (id) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('trayectos').findOne({ _id: new ObjectId(id) });
    }
};
