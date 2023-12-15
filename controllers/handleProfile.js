const { formatError } = require("../utils/formatError");

const handleProfile = async (req, res, knex) => {
  const { profileId } = req.params;
  const user = await knex
    .select(["id", "name", "email", "entries"])
    .from("users")
    .where("id", "=", profileId);

  if (user.length) {
    res.json(user[0]);
  } else {
    res.status(404).json(formatError("user not found"));
  }
};

module.exports = { handleProfile };
