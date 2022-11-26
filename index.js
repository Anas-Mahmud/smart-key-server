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
        const bookingsCollection = client.db('smartKey').collection('bookings');
        const usersCollection = client.db('smartKey').collection('users');

        // get all categories
        app.get('/categories', async (req, res) => {
            const query = {};
            const category = await categoryCollection.find(query).toArray();
            res.send(category);
        })

        // get all products
        app.get('/allProducts', async (req, res) => {
            const query = {};
            const products = await allProductsCollection.find(query).toArray();
            res.send(products);
        })

        // get products by category
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {
                category: id
            }
            const result = await allProductsCollection.find(query).toArray();
            res.send(result);
        })

        // get booking by email
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        // post booking
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        // post create user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', async (req, res) => {
    res.send('smart key server is running')
});

app.listen(port, () => console.log(`smart key running on ${port}`))