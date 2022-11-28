const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8octg6m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const categoryCollection = client.db('smartKey').collection('category');
        const allProductsCollection = client.db('smartKey').collection('allProducts');
        const bookingsCollection = client.db('smartKey').collection('bookings');
        const usersCollection = client.db('smartKey').collection('users');

        // verifyAdmin after verifyJWT
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        // get all categories
        app.get('/categories', async (req, res) => {
            const query = {};
            const category = await categoryCollection.find(query).toArray();
            res.send(category);
        })

        app.get('/selectCategories', async (req, res) => {
            const query = {};
            const result = await categoryCollection.find(query).project({ categoryId: 1 }).toArray();
            res.send(result);
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
            const query = {
                category: id
            }
            const result = await allProductsCollection.find(query).toArray();
            res.send(result);
        })

        // get user products by email *
        app.get('/myProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await allProductsCollection.find(query).toArray();
            res.send(result);
        })

        // post product *
        app.post('/products', verifyJWT, async (req, res) => {
            const product = req.body;
            const result = await allProductsCollection.insertOne(product);
            res.send(result);
        })

        // delete product *
        app.delete('/product/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await allProductsCollection.deleteOne(filter);
            res.send(result);
        })

        // get booking by email *
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
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

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            // console.log(user);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        });

        // // get verified User
        // app.get('/verifiedUser', async (req, res) => {
        //     const query = { status: 'verified' };
        //     const users = await usersCollection.find(query).toArray();
        //     res.send(users);
        // });

        // get buyer
        app.get('/buyers', async (req, res) => {
            const query = { role: 'buyer' };
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        // get seller
        app.get('/sellers', async (req, res) => {
            const query = { role: 'seller' };
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        // delete user *
        app.delete('/user/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        // isAdmin verify
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })

        // isSeller verify
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        })

        // post create user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // make verify *
        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, option)
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