const mongoose = require('mongoose');
const log4js = require('log4js');
const logger = log4js.getLogger('db');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reservasDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('✅ Conectado a MongoDB');
    } catch (error) {
        logger.error('❌ Error conectando a MongoDB', error);
        process.exit(1);
    }
};

module.exports = connectDB;
