const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173','https://employee-management-6b961.web.app'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

console.log('UserName: ', process.env.DB_USER);
console.log('Password: ', process.env.DB_PASS);


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    //await client.connect();

    const database = client.db("employeeDB");
    const usersCollectionUsers = database.collection("users");
    const usersCollectionTestimonials = database.collection("testimonials");
    const usersCollectionWorkSheets = database.collection("workSheets");
    const usersCollectionSalary = database.collection("salary");

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        })
        .send({ token });
    })

    const verifyToken = async (req, res, next) => {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollectionUsers.findOne(query);
      const isAdmin = user?.role === 'Admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    const verifyHr = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollectionUsers.findOne(query);
      const isAdmin = user?.role === 'HR';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    app.post('/logout', async (req, res) => {
      res.clearCookie('token', { maxAge: 0 }).send({ success: true });
    })

    app.get('/verify/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const cursor = usersCollectionUsers.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/users/:role/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollectionUsers.findOne(query);
      res.send(result);
    })

    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const cursor = usersCollectionUsers.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/users/:role', verifyToken,verifyHr, async (req, res) => {
      const role = req.params.role;
      const query = { role: role }
      const cursor = usersCollectionUsers.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/users/:role1/:role2/:role3', verifyToken, verifyAdmin, async (req, res) => {
      const role1 = req.params.role1;
      const role2 = req.params.role2;
      const query1 = { role: role1 }
      const query2 = { role: role2 }
      console.log('token', req.cookies.token)
      const cursor1 = usersCollectionUsers.find(query1);
      const cursor2 = usersCollectionUsers.find(query2)
      const result1 = await cursor1.toArray();
      const result2 = await cursor2.toArray();
      const result = result1.concat(result2);
      res.send(result);
    })

    app.patch('/users/:email', async (req, res) => {
      const id = req.params.email;
      const query = { email: id }
      const updateEmployee = req.body;
      console.log(query);
      const updateDoc = {
        $set: {
          verify: updateEmployee.verify,
          role: updateEmployee.role
        }
      }
      const result = await usersCollectionUsers.updateOne(query, updateDoc);
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await usersCollectionUsers.deleteOne(cursor);
      res.send(result);
    })


    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('new user', user);
      const result = await usersCollectionUsers.insertOne(user);
      res.send(result);
    })

    app.post('/worksheets', async (req, res) => {
      const work = req.body;
      console.log('new work', work);
      const result = await usersCollectionWorkSheets.insertOne(work);
      res.send(result);
    })

    app.get('/worksheets', async (req, res) => {
      const cursor = usersCollectionWorkSheets.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/testimonials', async (req, res) => {
      const cursor = usersCollectionTestimonials.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/payment', async (req, res) => {
      const payment = req.body;
      console.log('new payment', payment);
      const result = await usersCollectionSalary.insertOne(payment);
      res.send(result);
    })

    app.get('/salary', async (req, res) => {
      const cursor = usersCollectionSalary.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/salary/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const cursor = usersCollectionSalary.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //payment

    app.post("/create-payment-intent", async (req, res) => {
      const { salary } = req.body;

      const amount = parseInt(salary*100);

      console.log(amount,'amount insite');
    
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });


    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
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