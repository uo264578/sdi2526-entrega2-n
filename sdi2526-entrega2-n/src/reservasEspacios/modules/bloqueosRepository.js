const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "reservasDB";

module.exports = {
    findAllBloqueos: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('bloqueos').find({}).toArray();
    },

    findBloqueosByEspacio: async (espacioId) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('bloqueos').find({
            espacioId: espacioId,
            estado: 'ACTIVO'
        }).toArray();
    },

    findBloqueoById: async (id) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('bloqueos').findOne({ _id: new ObjectId(id) });
    },

    insertBloqueo: async (bloqueo) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('bloqueos').insertOne(bloqueo);
    },

    cancelarBloqueo: async (id) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('bloqueos').updateOne(
            { _id: new ObjectId(id) },
            { $set: { estado: 'CANCELADO' } }
        );
    }
};