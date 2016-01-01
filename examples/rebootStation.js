'use strict';

const STATION_PASSWORD = 'yourPasswordHere',
      STATION_ADDRESS = '10.0.1.1';

let Interface = require('../lib').Interface,
    station = new Interface(STATION_ADDRESS, STATION_PASSWORD);

station.reboot();
