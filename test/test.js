require('dotenv').config();
const http = require('http');
const testDebug = require('debug')('test');
const request = require('request');
const assert = require('chai').assert;
const async = require('async');
const server = require('../index');

const fs = require('fs');
const parallelyRequest = 10;
const requestAmt = 20;
describe('Connection', function() {
  let app;
  before(async function() {
    testDebug('create server');
    app = await server({ mode: 'SC' });
  });

  it(`Can handle request with single connection for ${requestAmt} connection`, function(
    done
  ) {
    this.timeout(300000); // A very long test

    async.timesLimit(
      requestAmt,
      parallelyRequest,
      function(n, next) {
        request('http://localhost:3000', function(error, response, body) {
          assert.equal(body, '50000');
          next(error, response.headers['x-response-time']);
        });
      },
      function(err, responsesTime) {
        fs.writeFileSync('./SC500.json', responsesTime.join('\n'), 'utf-8');
        done();
      }
    );
  });

  after(done => {
    app.close(done);
  });
});

describe('Pool', function() {
  describe('Single Pool Single Connection', function() {
    let app;
    before(async function() {
      testDebug('create server');
      app = await server({ mode: 'SPSC' });
    });

    it(`Can handle request with single connection for ${requestAmt} connection`, function(
      done
    ) {
      this.timeout(300000); // A very long test
  
      async.timesLimit(
        requestAmt,
        parallelyRequest,
        function(n, next) {
          request('http://localhost:3000', function(error, response, body) {
            assert.equal(body, '50000');
            next(error, response.headers['x-response-time']);
          });
        },
        function(err, responsesTime) {
          fs.writeFileSync('./SPSC500.json', responsesTime.join('\n'), 'utf-8');
          done();
        }
      );
    });

    after(done => {
      app.close(done);
    });
  });

  describe('Single Pool Multiple Connection', function() {
    let app;
    before(async function() {
      testDebug('create server');
      app = await server({ mode: 'SPMC' });
    });

    it(`Can handle request with multiple connection for ${requestAmt} connection`, function(
      done
    ) {
      this.timeout(300000); // A very long test
  
      async.timesLimit(
        requestAmt,
        parallelyRequest,
        function(n, next) {
          request('http://localhost:3000', function(error, response, body) {
            assert.equal(body, '50000');
            next(error, response.headers['x-response-time']);
          });
        },
        function(err, responsesTime) {
          fs.writeFileSync('./SPMC500.json', responsesTime.join('\n'), 'utf-8');
          done();
        }
      );
    });

    after(done => {
      app.close(done);
    });
  });
});
