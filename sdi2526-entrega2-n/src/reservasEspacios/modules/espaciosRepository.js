const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "reservasDB";

module.exports = {
    findAllEspacios: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('espacios').find({}).toArray();
    },

    findEspaciosActivos: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('espacios').find({ activo: true }).toArray();
    },

    findEspacioById: async (id) => {
        await client.connect();
        const db = client.db(dbName);

        if (!ObjectId.isValid(id)) {
            return null;
        }

        return db.collection('espacios').findOne({ _id: new ObjectId(id) });
    },

    findEspacioByNombre: async (nombre) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('espacios').findOne({ nombre: nombre, activo: true });
    },

    insertEspacio: async (espacio) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('espacios').insertOne(espacio);
    },

    updateEspacio: async (id, espacio) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('espacios').updateOne(
            { _id: new ObjectId(id) },
            { $set: espacio }
        );
    },

    changeActivo: async (id, activo) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('espacios').updateOne(
            { _id: new ObjectId(id) },
            { $set: { activo: activo } }
        );
    }
};