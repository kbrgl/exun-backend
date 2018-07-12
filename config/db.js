const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    database: 'exun2018',
    password: '',
  },
});

module.exports = knex;
