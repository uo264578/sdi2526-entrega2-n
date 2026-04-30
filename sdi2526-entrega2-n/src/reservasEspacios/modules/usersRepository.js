const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = "reservasDB";

module.exports = {
    findUserByDni: async (dni) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').findOne({ dni: dni });
    },

    insertUser: async (user) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').insertOne(user);
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
        return db.collection('usuarios').updateOne(
            { _id: new ObjectId(id) },
            { $set: user }
        );
    },
    updatePasswordByDni: async (dni, hashedPassword) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').updateOne(
            { dni: dni },
            { $set: { password: hashedPassword } }
        );
    },
    findUsersPaginated: async (skip, limit) => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').find({}).skip(skip).limit(limit).toArray();
    },

    countUsers: async () => {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('usuarios').countDocuments();
    }
};