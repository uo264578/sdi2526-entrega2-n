const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "flotasDB";

module.exports = {
    findVehiculoByMatricula: async (matricula) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('vehiculos').findOne({ matricula: matricula });
    },

    findVehiculoByBastidor: async (bastidor) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('vehiculos').findOne({ bastidor: bastidor });
    },

    insertVehiculo: async (vehiculo) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('vehiculos').insertOne(vehiculo);
    },

    findAllVehiculos: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('vehiculos').find({}).toArray();
    },

    deleteVehiculoById: async (id) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('vehiculos').deleteOne({ _id: new ObjectId(id) });
    }
};
