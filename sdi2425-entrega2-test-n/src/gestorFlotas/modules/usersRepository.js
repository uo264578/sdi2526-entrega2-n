const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "flotasDB";

module.exports = {
    findUserByDni: async (dni) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').findOne({ dni: dni });
    },

    insertUser: async (user) => {
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('usuarios').insertOne(user);
        return result;
    },

    findAllUsers: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').find({}).toArray();
    },
    findUserById: async (id) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').findOne({ _id: new ObjectId(id) });
    },

    updateUser: async (id, user) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').updateOne({ _id: new ObjectId(id) }, { $set: user });
    },

    findUserByEmail: async (email) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').findOne({ email: email });
    }

};

