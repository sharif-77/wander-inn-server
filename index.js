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
  if (!token) {
    return res.send({message:'User UnAuthorized first',error:true});
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.send({message:'User UnAuthorized second',error:true});
    }
    req.decoded = decoded;
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
    const reviewsCollection = client.db("WanderInn").collection("reviews");
    const myBookingsCollection = client.db("WanderInn").collection("myBookings");
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
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result)

    })


    app.put('/rooms/:id',async (req,res)=>{
      const id=req.params.id;
      const dataForUpdate=req.body;
      const {availability}=dataForUpdate;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          availability
        },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })


    app.get('/bookings',verifyToken,async (req,res)=>{
      const decodedEmail=req.decoded.email
      const email=req.query.email;
      if (email !== decodedEmail) {
        return
      }
      const query={email:email}
      const data =  myBookingsCollection.find(query);
      const result=await data.toArray()
      res.send(result)
    })
    app.post('/bookings',async (req,res)=>{
      const data=req.body;
      const result = await myBookingsCollection.insertOne(data);
      res.send(result)
   })
   app.put('/status/:id',async (req,res)=>{
    const id=req.params.id;
    const dataForUpdate=req.body;
    console.log(id);
    console.log(dataForUpdate);
    const {status}=dataForUpdate;
    console.log(status);
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        status:status,
      },
    };
    const result = await myBookingsCollection.updateOne(filter, updateDoc, options);
    res.send(result)
  })
   app.put('/updateDate/:id',async (req,res)=>{
    const id=req.params.id;
    const dataForUpdate=req.body;
    console.log(id);
    console.log(dataForUpdate);
    const {date}=dataForUpdate;
    console.log(date);
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: { 
        startDate:date

      },
    };
    const result = await myBookingsCollection.updateOne(filter, updateDoc, options);
    res.send(result)
  })



  app.delete('/bookings/:id',async (req,res)=>{
    const id=req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await myBookingsCollection.deleteOne(query);
    res.send(result)
  })

  // review

  app.get('/reviews',async (req,res)=>{
    const serviceName=req.query.serviceName
    console.log(serviceName);
    const query = { 
      serviceName: serviceName };
    const data =  reviewsCollection.find(query);
    const result=await data.toArray()
    res.send(result)
  })

  app.post('/review',async (req,res)=>{
    const data=req.body;
    const result = await reviewsCollection.insertOne(data);
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

