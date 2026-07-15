const db = require("../config/db");

/**
 * Retrieves all numbers from the database.
 * @returns {Promise<Array>} Array of number records
 */
const getAllValues = async () => {
  const result = await db.query("SELECT * FROM numbers");
  return result.rows;
};

/**
 * Inserts a new number into the database.
 * @param {number} value 
 * @returns {Promise<object>} Inserted row
 */
const insertValue = async (value) => {
  const result = await db.query(
    "INSERT INTO numbers(number) VALUES($1) RETURNING *",
    [value]
  );
  return result.rows[0];
};

module.exports = {
  getAllValues,
  insertValue,
};
