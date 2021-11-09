const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.myaif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri)

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.connect(err => {
    const productCollection = client.db("bikeStore").collection("products");
    const userCollection = client.db("bikeStore").collection("users");
    const reviewCollection = client.db("bikeStore").collection("products");
    
    // client.close();
  });




app.get("/", (req, res) => {
    res.send("Hello World!");
  });

app.listen(port)
  