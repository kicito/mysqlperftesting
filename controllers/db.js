const appDebug = require('debug')('mysql');
const mysql = require('mysql');

let pool;

function getConnection() {
  console.log('Getting Connection');
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      port: 3306
    });
    connection.connect(err => {
      if (err) {
        return reject(err);
      }
      return resolve(connection);
    });
  });
}

function getPoolConnection() {
  console.log('Getting PoolConnection');

  return new Promise((resolve, reject) => {
    const pool = mysql.createPool({
      connectionLimit: Number(process.env.MYSQL_CONNECTIONS),
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      port: 3306
    });

    pool.getConnection(function(err, connection) {
      if (err) {
        return reject(err);
      }
      return resolve(connection);
    });
  });
}

function getConnectionFromPool(pool) {
  console.log('Getting ConnectionFromPool');

  return new Promise(resolve => {
    pool.getConnection((err, connection) => {
      return resolve(connection);
    });
  });
}

function getPool() {
  console.log('Getting Pool');

  return new Promise((resolve, reject) => {
    const pool = mysql.createPool({
      connectionLimit: Number(process.env.MYSQL_CONNECTIONS),
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      port: 3306
    });
    return resolve(pool);
  });
}

module.exports = {
  getConnection,
  getPool,
  getConnectionFromPool,
  getPoolConnection
};
