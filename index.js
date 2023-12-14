const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
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
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await knex
    .select("email", "hash")
    .from("login")
    .where("email", "=", email);

  // if not found it will return an empty array
  if (!user.length) {
    return res.status(404).json({ message: "user not found", error: true });
  } else {
    const { hash } = user[0];
    const isMatched = await bcrypt.compare(password, hash); // true if passwords match
    if (isMatched) {
      const verifiedUser = await knex
        .select(["id", "name", "email", "entries"])
        .from("users")
        .where("email", "=", email);

      return res.json(verifiedUser[0]);
    } else {
      // passwords do not match
      res.status(401).json({
        error: true,
        message: "this email and password combination is not found",
      });
    }
  }
});

// REGISTER ROUTE
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  const trx = await knex.transaction();
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await trx
      .insert({
        hash: hashPassword,
        email,
      })
      .into("login") // insert into login table
      .returning("email"); // [ { email: 'asjkjfl@gmail.com' } ]
    const registerEmail = result[0].email;

    const userResult = await trx("users")
      .returning(["id", "name", "email", "entries"])
      .insert({
        name,
        email: registerEmail,
        joinedon: new Date(),
      });
    res.json(userResult[0]);
    await trx.commit();
  } catch (err) {
    res.status(400).json({ message: "something is wrong", error: true });
    await trx.rollback();
  }
});

// TO DO - update to async await syntax
// PROFILE ID ROUTE
app.get("/profile/:profileId", (req, res) => {
  const { profileId } = req.params;

  knex
    .select(["id", "name", "email", "entries"])
    .from("users")
    .where("id", "=", profileId)
    .then((user) => {
      // if not found knex returns an empty array
      user.length
        ? res.json(user[0])
        : res.status(404).json({ message: " user not found" });
    })
    .catch((err) => res.json(400).json({ err }));
});

// IMAGE ROUTE to update entries number
app.put("/image", (req, res) => {
  const { userId } = req.body;
  knex("users")
    .where("id", "=", userId)
    .increment("entries", 1)
    .returning("entries") // [{ entries:30 }]
    .then((user) => res.json(user[0].entries))
    .catch((err) =>
      res.status(404).json({ message: "user not found", detail: err.detail })
    );
});

// Listen on port 3001
app.listen(3001, () => {
  console.log("listening on port 3001");
});
