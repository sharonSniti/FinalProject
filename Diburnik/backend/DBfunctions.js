
const url = 'mongodb+srv://Nadav:Nc123456@cluster0.ohqxoec.mongodb.net/?retryWrites=true&w=majority'
const { MongoClient } = require('mongodb');
const client = new MongoClient(url, { useUnifiedTopology: true });


const dbName = 'kindergarten1';


const connect = async () => {
    try {
      await client.connect(url); // Use the new connection string
      console.log('Connected to the database');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  };
  

async function addToDB(collectionName, documents) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const result = await collection.insertMany(documents);
        console.log(`${result.insertedCount} documents inserted.`);
    } catch (error) {
        console.error('Error inserting documents:', error);
    }
}





/*For login Screen*/
const findUser = async (username, password) => {
    const db = client.db(dbName);
    const collection = db.collection('login'); 

    try {
        const user = await collection.findOne({ username, password });
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
};



module.exports = {
    connect,
    addToDB,
    findUser
};
