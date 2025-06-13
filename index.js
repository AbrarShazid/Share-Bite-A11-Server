const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@shazid.sdvbyar.mongodb.net/?retryWrites=true&w=majority&appName=Shazid`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db("ShareBite").collection("foods");
    const requestCollection = client.db("ShareBite").collection("foodRequest");

    // api
    app.post("/foods", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });

    // 6 food item for feature

    app.get("/featured-foods", async (req, res) => {
      try {
        const featuredFoods = await foodCollection
          .find()
          .sort({ quantity: -1 })
          .limit(6)
          .toArray();

        res.send(featuredFoods);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch featured foods." });
      }
    });

    // all available food

    app.get("/available-food", async (req, res) => {
      try {
        const { sort } = req.query;
        let sortOption = {};

        if (sort === "expire-asc") {
          sortOption = { expire: 1 }; // Ascending
        } else if (sort === "expire-desc") {
          sortOption = { expire: -1 }; // Descending (
        }

        const allfoods = await foodCollection.find().sort(sortOption).toArray();
        res.send(allfoods);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch featured foods." });
      }
    });
    // food details
    app.get("/food-details/:id", async (req, res) => {
      const id = req.params.id;

      const result = await foodCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });



    // change status after request  

   app.patch("/status-change/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await foodCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { availability: "Requested" } }
    );

    res.send( result );
  } catch (error) {
 
    res.status(500).send();
  }
});





    // --------------------------------------------->>>>> food request api <<<<-----------------------------------------------

    // post 
    app.post("/requestFood",async (req,res)=>{
      const request=req.body
      const result=await requestCollection.insertOne(request)
      res.send(result);


    })



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

app.get("/", (req, res) => {
  res.send("Carrer code cooking");
});

app.listen(port, () => {
  console.log("shazid");
});
