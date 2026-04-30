const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "reservasDB";

module.exports = {
    findAllReservas: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('reservas').find({}).toArray();
    },

    findReservasByUsuario: async (dniUsuario) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('reservas').find({ dniUsuario: dniUsuario }).toArray();
    },

    findReservaById: async (id) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('reservas').findOne({ _id: new ObjectId(id) });
    },

    findReservasActivasByEspacio: async (espacioId) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('reservas').find({
            espacioId: espacioId,
            estado: 'ACTIVA'
        }).toArray();
    },

    findReservasFiltradas: async (filtro) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('reservas').find(filtro).toArray();
    }
};