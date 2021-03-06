const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.myaif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}


client.connect(err => {
    const productCollection = client.db("bikeStore").collection("products");
    const usersCollection = client.db("bikeStore").collection("users");
    const orderCollection = client.db("bikeStore").collection("myOrders");
    const reviewCollection = client.db("bikeStore").collection("reviews");
    

    //add new product
    app.post('/addNewProduct',async(req, res)=>{
        const data = req.body;
        const result = await productCollection.insertOne(data);
        res.json(result)
    });
    //get all products
    app.get('/products', async(req,res)=>{
        const result = await productCollection.find({}).toArray();
        res.send(result)
    });

    // get specific one
    app.get('/placeOrder/:id',async (req,res)=>{
        const id = req.params.id;
        const result = await productCollection.findOne({_id : ObjectId(id)});
        res.send(result)
    });

    //add a product by user
    app.post('/addOrder',async(req, res)=>{
        const product = req.body;
        const result = await orderCollection.insertOne(product)
        res.json(result)
    });

   
    app.get('/myOrders', async (req, res) => {
        const email = req.query.email;
        const query = { email: email}

        const cursor = orderCollection.find(query);
        const result = await cursor.toArray();
        res.json(result);
    });

    app.get('/allOrders', async (req, res) => {
    
        const result =await orderCollection.find({}).toArray();
        res.json(result);
    });
    app.put('/allOrders/:id', async (req, res) => {
        const id = req.params.id;
        const filter = {_id : ObjectId(id)}
        // console.log(filter);
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              status: "shipped"
            },
          };
          const result = await orderCollection.updateOne(filter, updateDoc, options);
         res.send(result)
    });

    //delete product
    app.delete('/products/delete/:id', async (req,res)=>{
        const id = req.params.id;
        const result = await productCollection.deleteOne({_id : ObjectId(id)});
        res.send(result)
    });
    
    //delete order item
    app.delete('/deleteOrder/:id',async (req,res)=>{
        const id = req.params.id;
        const email = req.query.email;
        const result = await orderCollection.deleteOne({
            email : email  });
        res.json(result)
    
    });
    app.delete('/clearOrder/:id',async(req,res)=>{
        const id = req.params.id;
        const result = await orderCollection.deleteOne({
            _id : ObjectId(id)
        })
        res.json(result)
    });
    // save user
    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });

    // update user
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    //make admin
    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };

        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);

    });

    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    });

    //add and get reviews
    app.post('/addReview',async (req,res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result)
    });

    app.get('/allReview',async (req,res)=>{
        const result = await reviewCollection.find({}).toArray();
        res.json(result)
    })

    // client.close();
  });




app.get("/", (req, res) => {
    res.send("Hello World!");
  });

app.listen(port)
  