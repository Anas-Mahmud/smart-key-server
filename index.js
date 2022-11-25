const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8octg6m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const allProductsCollection = client.db('smartKey').collection('allProducts');

        app.get('/allProducts', async (req, res) => {
            const query = {};
            const products = await allProductsCollection.find(query).toArray();
            res.send(products);
        })
    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', async (req, res) => {
    res.send('smart key server is running')
});

app.listen(port, () => console.log(`smart key running on ${port}`))