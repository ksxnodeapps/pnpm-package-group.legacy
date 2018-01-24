'use strict'
const {spawn} = require('child_process')

/**
 * NOTES:
 *
 * Don't use spawnSync because stdio wouldn't be printed in real-time
 *
 * Don't spawn multiple processes asynchronously because of CPU and Memory usage
 *
 */

let prevPromise = Promise.resolve('Initial Promise')

module.exports = (...args) => {
  const lastPromise = prevPromise

  const newPromise = new Promise(async resolve => {
    await lastPromise
    spawn(...args).on('exit', (status, signal) => resolve({status, signal}))
  })

  prevPromise = newPromise
  return newPromise
}
