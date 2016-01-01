'use strict';
let Discovery = require('airport').Discovery;

let listener = new Discovery();

listener.on('airport', function (airport) {
  console.log(`Base station ${airport.name} found at ${airport.service.addresses[0]}`);
});
