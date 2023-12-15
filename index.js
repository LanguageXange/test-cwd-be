const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { handleImage, handleAPI } = require("./controllers/handleImage");
const { handleRegister } = require("./controllers/handleRegister");
const { handleSignIn } = require("./controllers/handleSignIn");
const { handleProfile } = require("./controllers/handleProfile");
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "Cindy",
    password: "",
    database: "img-detect",
  },
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// SIGN IN ROUTE
app.post("/signin", (req, res) => handleSignIn(req, res, knex, bcrypt));
// REGISTER ROUTE
app.post("/register", (req, res) => handleRegister(req, res, knex, bcrypt));
// PROFILE ID ROUTE
app.get("/profile/:profileId", (req, res) => handleProfile(req, res, knex));

// IMAGE ROUTE to update entries number
app.put("/image", (req, res) => handleImage(req, res, knex));

// IMAGE URL ROUTE to make API call to CLARIFAI with gRPC
app.post("/imageurl", (req, res) => handleAPI(req, res));
// Listen on port 3001
app.listen(process.env.PORT || 3001, () => {
  console.log("listening on port 3001");
});
