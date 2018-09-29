const knex = require('knex')({
  client: 'mysql',
  connection: process.env.DATABASE_URL,
});

module.exports = knex;
