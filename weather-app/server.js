const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const cors = require("cors");
let mongoObjectId = mongodb.ObjectId;
const bodyParser = require("body-parser");
const PORT = 3000;
app.use(bodyParser.json());
app.use(cors());
app.set("view engine", "ejs");
app.use("/static", express.static("static"));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://localhost:27017/Weatherdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const weatherSchema = new mongoose.Schema({
  validTime: String,
  temperature: String,
  windSpeed: String,
});

const Day = mongoose.model("day", weatherSchema);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/days", async (req, res) => {
  try {
    const days = await Day.find();
    res.json(days);
  } catch (error) {
    console.error(error);
  }
});

app.post("/", (req, res) => {
  const day = new Day({
    validTime: req.body.validTime,
    temperature: req.body.temp,
    windSpeed: req.body.windSpeed,
  });

  day.save(function (err) {
    if (!err) {
      res.sendStatus(201);
    } else {
      console.log(err);
      res.sendStatus(500);
    }
  });
});

app.get("/:id", (req, res) => {
  console.log(req.params.id);

  Day.findById(req.params.id, function (err, day) {
    if (err) {
      res.sendStatus(404);
    } else {
      res.json(day);
    }
  });
});

app.put("/:id", (req, res) => {
  console.log(req.params.id);

  Day.findByIdAndUpdate(
    req.params.id,
    { message: req.body.message },
    function (err, docs) {
      if (err) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

app.delete("/:id", (req, res) => {
  Day.findByIdAndRemove(req.params.id, (err, Days) => {
    if (err) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  });
});

app.listen(PORT, () => {
  console.log("det funkar");
});
