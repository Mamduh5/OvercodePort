const { knex } = require('../libs/knex.js');
const findOne = async (table, conditions) => {
  const result = await knex(table)
    .where(conditions)  // Knex automatically builds the WHERE clause
    .first();  // Limits the result to a single record (equivalent to LIMIT 1)

  return result || null;  // Returns the first record or null if no match
};

const findMany = async (table, conditions) => {
  const results = await knex(table)
    .where(conditions);  // Knex automatically builds the WHERE clause to match conditions

  return results;  // Returns all matching records, or an empty array if no matches
};

const insertRecord = async (table, insertData) => {
  try {
    const result = await knex(table).insert(insertData);
    // For MySQL, result contains the inserted ID(s).
    return result; // Returns the inserted ID(s) as an array.
  } catch (error) {
    console.error('Error inserting record:', error);
    throw error;
  }
};


const updateRecord = async (table, conditions, updateData) => {
  const result = await knex(table)
    .where(conditions)    // Specify the conditions to identify the record(s) to update
    .update(updateData);  // Specify the data to update

  return result;  // Returns the number of rows affected
};










module.exports = {
  insertRecord,
  updateRecord,
  findOne,
  findMany  
};
