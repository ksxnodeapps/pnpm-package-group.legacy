'use strict'
/* eslint prefer-promise-reject-errors: 'off' */

module.exports = ([filename]) => filename
  ? new Promise(
    (resolve, reject) => require('fs').readFile(
      filename,
      'utf8',
      (error, data) => error ? reject({type: 'fs', error}) : resolve(data)
    )
  )
  : require('get-stdin')()
    .catch(error => ({type: 'stdin', error}))
