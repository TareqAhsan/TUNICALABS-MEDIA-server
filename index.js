const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 5000;
//middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aubya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("TUNICALABS_MEDIA");
    const studentCollection = database.collection("Students_DB");

    app.post("/dashboard/addstudent", async (req, res) => {
      const body = req.body;
      const result = await studentCollection.insertOne(body);
      res.send(result);
    });

    app.get("/dashboard/viewstudent/", async (req, res) => {
      // const email = req.params.email;
      const query = req.query;
      console.log(query);
      const { email, page, size } = req.query;

      const filter = { email: email };
      const cursor = studentCollection.find(filter);
      const count = await cursor.count();
      let result;
      if (page) {
        result = await cursor
          .skip(page * size)
          .limit(Number(size))
          .toArray();
      } else {
        result = await cursor.toArray();
      }

      console.log(count);
      res.send({ result, count });
    });
    app.put("/dashboard/edit/:id", async (req, res) => {
      const body = req?.body;
      console.log(body);
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = { $set: body };
      const result = await studentCollection.updateOne(filter, updatedDoc);

      console.log(result);
      res.send(result);
    });
    app.delete("/dashboard/viewstudent/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await studentCollection.deleteOne(filter);
      console.log(result);
      res.send(result);
    });
    app.get("/dashboard/search", async (req, res) => {
      const {value,email} = req.query;
      const filter = {email:email}
      const result = await studentCollection.find(filter).toArray();
      const cursor = result.filter((stu) =>
        stu.name.toLowerCase().includes(value.toLowerCase())
      );
     
      res.send(cursor);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.json("hello server");
});
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
