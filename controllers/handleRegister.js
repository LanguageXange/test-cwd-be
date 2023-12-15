const { formatError } = require("../utils/formatError");
const handleRegister = async (req, res, knex, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json(formatError("invalid form submission"));
  }
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
    res.status(400).json(formatError("something is wrong during registration"));
    await trx.rollback();
  }
};

module.exports = { handleRegister };
