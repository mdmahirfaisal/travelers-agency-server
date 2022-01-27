const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const app = express()
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000



// middle ware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwoya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });





async function run() {
    try {
        await client.connect();
        console.log('travel agency database connected successfully');
        const database = client.db("travel_agency");
        const blogsCollection = database.collection("blogs");
        const commentsCollection = database.collection("comments");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection("users");


        // GET API Load all orders
        app.get('/orders', async (req, res) => {
            const cursor = commentsCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // GET API orders by specific user
        app.get('/ordersData', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email };
            const cursor = commentsCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })

        // POST API  orders send to database
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await commentsCollection.insertOne(orders);
            res.json(result);
        });

        // DELETE Order  with user
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await commentsCollection.deleteOne(query);
            res.send(result)
        })


        // GET All blog 
        // app.get('/blogs', async (req, res) => {
        //     const cursor = blogsCollection.find({});
        //     const blogs = await cursor.toArray();
        //     res.send(blogs);
        // })


        // GET API Load  page filter blogs
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            console.log(req.query);
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let blogs;
            const count = await cursor.count();
            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                blogs = await cursor.count();
            }

            res.send({
                count,
                blogs
            });
        })


        // GET single Product API
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.findOne(query);
            console.log(result);
            res.send(result)
        });


        // DELETE Order  with user
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
            res.send(result)
        })


        // POST API  products send to database
        app.post('/products', async (req, res) => {
            const products = req.body;
            console.log(products);
            const result = await blogsCollection.insertOne(products);
            res.json(result);
        });

        // PUT API product update 

        app.put('/updateProduct', (req, res) => {
            const { id, name, price, description, img } = req.body;
            console.log(req.body);
            blogsCollection.findOneAndUpdate(
                { _id: ObjectId(id) },
                {
                    $set: { name, price, description, img },
                }
            ).then(result => res.send(result.lastErrorObject.updatedExisting))
        })



        // POST API  review send to database
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        // GET API Load all review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })



        // GET API specific user email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            res.json({ admin: isAdmin });

        });


        // POST API users
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('new user added successfully', user);
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // PUT API users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // PUT API users admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result, 'admin created successfully');
            res.json(result);
        })

        // PUT API status update 
        app.put('/updateOrderStatus', (req, res) => {
            const { id, status } = req.body;
            commentsCollection.findOneAndUpdate(
                { _id: ObjectId(id) },
                {
                    $set: { status },
                }
            ).then(result => res.send(result.lastErrorObject.updatedExisting))
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Travel Agency "API"   Here')
})

app.listen(port, () => {
    console.log(` listening travel agency ${port}`)
})