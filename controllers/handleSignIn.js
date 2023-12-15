const { formatError } = require("../utils/formatError");

const handleSignIn = async (req, res, knex, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json(formatError("invalid form submission!"));
  }
  const user = await knex
    .select("email", "hash")
    .from("login")
    .where("email", "=", email);

  // if not found it will return an empty array
  if (!user.length) {
    return res.status(404).json(formatError("sorry! user not found"));
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
      res
        .status(401)
        .json(formatError("this email and password combination is not found"));
    }
  }
};

module.exports = { handleSignIn };
