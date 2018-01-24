'use strict'
const {spawnSync} = require('child_process')

module.exports = (...args) =>
  Promise.resolve(spawnSync(...args))
