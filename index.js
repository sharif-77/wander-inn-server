const express = require('express')
require("dotenv").config();
const cookieParser = require('cookie-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}))
app.use(express.json());
app.use(cookieParser())


const verifyToken = (req, res, next) => {
  const token = req.cookies.token
  // console.log(token);
  if (!token) {
    return res.send({message:'User UnAuthorized first',error:true});
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.send({message:'User UnAuthorized second',error:true});
    }
    req.decoded = decoded;
    console.log(decoded);

    next();
  });
};



const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.pkahof5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const roomsCollection = client.db("WanderInn").collection("rooms");
    const offersCollection = client.db("WanderInn").collection("Offers");
    const testimonialsCollection = client.db("WanderInn").collection("testimonials");

    
   app.get('/offers',async (req,res)=>{
      const data =  offersCollection.find();
      const result=await data.toArray()
      res.send(result)
    })
   app.get('/testimonials',async (req,res)=>{
      const data =  testimonialsCollection.find();
      const result=await data.toArray()
      res.send(result)
    })
   app.get('/rooms',async (req,res)=>{
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
      const data =  roomsCollection.find();
      const result=await data.sort({ price: sortOrder }).toArray()
      res.send(result)
    })
    app.get('/room/:id',async (req,res)=>{
      const id=req.params.id
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result)

    })
    app.post('/jwt',async(req,res)=>{
      const email=req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "1h",
      })
      res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
      })
      .send(token);

    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

