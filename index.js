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
        const categoryCollection = client.db('smartKey').collection('category');
        const allProductsCollection = client.db('smartKey').collection('allProducts');

        app.get('/categories', async (req, res) => {
            const query = {};
            const category = await categoryCollection.find(query).toArray();
            res.send(category);
        })

        app.get('/allProducts', async (req, res) => {
            const query = {};
            const products = await allProductsCollection.find(query).toArray();
            res.send(products);
        })

        app.get('/products/:category', async (req, res) => {
            const category = req.params.category;
            console.log(category);
            const query = {
                category: category
            }
            const result = await allProductsCollection.find(query).toArray();
            res.send(result);
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