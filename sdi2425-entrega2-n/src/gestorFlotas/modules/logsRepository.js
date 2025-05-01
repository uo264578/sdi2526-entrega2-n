const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "flotasDB";

module.exports = {
    insertarLog: async (log) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('logs').insertOne(log);
    },

    buscarLogs: async (tipo) => {
        await client.connect();
        const db = client.db(dbName);
        const filtro = tipo ? { tipo: tipo } : {};
        return db.collection('logs').find(filtro).sort({ fechaHora: -1 }).toArray();
    },

    borrarLogs: async (tipo) => {
        await client.connect();
        const db = client.db(dbName);
        const filtro = tipo ? { tipo: tipo } : {};
        return db.collection('logs').deleteMany(filtro);
    }
};
