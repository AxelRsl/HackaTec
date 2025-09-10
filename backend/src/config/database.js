const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/interprete-sordomudos';
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conexión a MongoDB establecida con éxito');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectToDatabase };
