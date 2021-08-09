const MongoClient = require('mongodb').MongoClient;

class DatabaseRepository {
    constructor(url) {
        this.url = url;
    }

    async openConnection(dbName) {
        const mongoClient = new MongoClient(this.url);
        const getClient = async () => { 
            return mongoClient.connect().then(client => {
                return client;
            });
        }

        this.client = await getClient();
        this.db = this.client.db(dbName);
    }

    closeConnection() {
        this.client.close();
    }
    
    async insertOne(collectionName, data) {
        return await this.db.collection(collectionName).insertOne(data);
    }

    async insertMany(collectionName, data) {
        return await this.db.collection(collectionName).insertMany(data);
    }

    async find(collectionName, filter) {
        return await this.db.collection(collectionName).find(filter).toArray();
    }

    async findOne(collectionName, filter) {
        return await this.db.collection(collectionName).findOne(filter).then(result => {
            return result;
        });
    }

    async deleteMany(collectionName, filter) {
        return this.db.collection(collectionName).deleteMany(filter, (err, result) => {
            if (err) return console.log(err);
            return result;
        });
    }

    async deleteOne(collectionName, filter) {
        return this.db.collection(collectionName).deleteOne(filter, (err, result) => {
            if (err) return console.log(err);
            return result;
        });
    }

    async updateOne(collectionName, filter, newData) {
        return await this.db.collection(collectionName).updateOne(filter, newData);
    }

    async updateMany(collectionName, filter) {
        return this.db.collection(collectionName).updateMany(filter, newData, (err, result) => {
            if (err) return console.log(err);
            return result;
        });
    }

    async fundOneAndUpdate(collectionName, filter, updateParameter) {
        return this.db.collection(collectionName).fundOneAndUpdate(filter, newData, updateParameter, (err, result) => {
            if (err) return console.log(err);
            return result;
        });
    }
}

module.exports = DatabaseRepository;