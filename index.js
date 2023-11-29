const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

console.log('UserName: ', process.env.DB_USER);
console.log('Password: ', process.env.DB_PASS);


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s6b6iw5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("employeeDB");
    const usersCollectionUsers = database.collection("users");
    const usersCollectionTestimonials = database.collection("testimonials");

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
      res
      .cookie('token',token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true});
    })

    app.post('/logout', async(req,res) => {
      const user = req.body;
      res.clearCookie('token',{maxAge: 0}).send({success: true});
    })

    app.get('/users', async (req, res) => {
      const cursor = usersCollectionUsers.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('new user', user);
      const result = await usersCollectionUsers.insertOne(user);
      res.send(result);
    })

    app.get('/testimonials', async (req, res) => {
      const cursor = usersCollectionTestimonials.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    /*
 
    app.get('/stunning', async (req, res) => {
      const cursor = usersCollectionStunning.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/testimonials', async (req, res) => {
      const cursor = usersCollectionTestimonials.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/rooms', async (req, res) => {
      const cursor = usersCollectionRooms.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/rooms/:title', async (req, res) => {
      const title = req.params.title;
      const query = { title: title }
      const result = await usersCollectionRooms.findOne(query);
      res.send(result);
    })
 
    app.patch('/rooms/:title', async (req, res) => {
      const title = req.params.title;
      const query = { title: title }
      const updateRoom = req.body;
      console.log(updateRoom);
      const updateDoc = {
        $set: {
          available: updateRoom.available,
          review: updateRoom.review,
          star: updateRoom.star
        }
      }
      const result = await usersCollectionRooms.updateOne(query, updateDoc);
      res.send(result);
    })
 
    app.get('/roomPhotos', async (req, res) => {
      const cursor = usersCollectionRoomPhotos.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/roomPhotos/:title', async (req, res) => {
      const title = req.params.title;
      const query = { title: title }
      const cursor = usersCollectionRoomPhotos.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/booking', async (req, res) => {
      const cursor = usersCollectionRoomBooking.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/booking/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const cursor = usersCollectionRoomBooking.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/booking/:email/:title/:review', async (req, res) => {
      const review = req.params.review;
      const email = req.params.email;
      const title = req.params.title;
      const query = { email: email, title: title, review: review }
      const cursor = usersCollectionRoomBooking.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/booking/:email/:date/:title', async (req, res) => {
      const title = req.params.title;
      const date = req.params.date;
      const query = { title: title, date: date }
      const cursor = usersCollectionRoomBooking.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.post('/booking', async (req, res) => {
      const room = req.body;
      console.log('new room', room);
      const result = await usersCollectionRoomBooking.insertOne(room);
      res.send(result);
    })
 
    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      console.log('delete server id: ', id);
      const cursor = { _id: new ObjectId(id) };
      const result = await usersCollectionRoomBooking.deleteOne(cursor);
      res.send(result);
    })
 
    app.patch('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const updateRoom = req.body;
      console.log(updateRoom);
      const updateDoc = {
        $set: {
          date: updateRoom.date
        }
      }
      const result = await usersCollectionRoomBooking.updateOne(query, updateDoc);
      res.send(result);
    })
 
    app.patch('/booking/:email/:title/:review', async (req, res) => {
      const review = req.params.review;
      const email = req.params.email;
      const title = req.params.title;
      const query = { email: email, title: title, review: review }
      const updateRoom = req.body;
      console.log(updateRoom);
      const updateDoc = {
        $set: {
          review: updateRoom.review
        }
      }
      const result = await usersCollectionRoomBooking.updateOne(query, updateDoc);
      res.send(result);
    })
 
    app.get('/review', async (req, res) => {
      const cursor = usersCollectionRoomReview.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/review/:title', async (req, res) => {
      const title = req.params.title;
      const query = { title: title }
      const cursor = usersCollectionRoomReview.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.post('/review', async (req, res) => {
      const room = req.body;
      console.log('new review', room);
      const result = await usersCollectionRoomReview.insertOne(room);
      res.send(result);
    })
 
 
    
    app.get('/cart', async (req, res) => {
      const cursor = usersCollectionCart.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/cart/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const product = usersCollectionCart.find(query);
      const result = await product.toArray();
      res.send(result);
    })
 
    app.get('/products', async (req, res) => {
      const cursor = usersCollectionProducts.find()
      const result = await cursor.toArray();
      res.send(result);
    })
 
    app.get('/products/:brand', async (req, res) => {
      const brand = req.params.brand;
      const query = { brandName: brand }
      const product = usersCollectionProducts.find(query);
      const result = await product.toArray();
      res.send(result);
    })
 
    app.get('/products/:brand/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const product = await usersCollectionProducts.findOne(query);
      res.send(product);
    })
 
    app.put('/products/:brand/:id', async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      console.log('update product : ', product);
      const updatedProduct = {
        $set: {
          productName: product.productName,
          brandName: product.brandName,
          type: product.type,
          price: product.price,
          photo: product.photo,
          rating: product.rating
        }
      }
      const result = await usersCollectionProducts.updateOne(filter, updatedProduct, options);
      res.send(result);
    })
 
    app.post('/products', async (req, res) => {
      const product = req.body;
      console.log('new product', product);
      const result = await usersCollectionProducts.insertOne(product);
      res.send(result);
    })
 
    app.post('/cart', async (req, res) => {
      const product = req.body;
      console.log('new cart product', product);
      const result = await usersCollectionCart.insertOne(product);
      res.send(result);
    })
 
    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      console.log('delete server id: ', id);
      const query = { _id: new ObjectId(id) };
      const result = await usersCollectionCart.deleteOne(query);
      res.send(result);
    })
 
    */

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Employee is Running serverrr");
})

app.listen(port, () => {
  console.log(`Ser running port: ${port}`);
}) 