'use strict'
const {readFileSync} = require('fs')
const {writeFileSync} = require('fs-force')

module.exports = (filename, object) => {
  const write = object =>
    writeFileSync(filename, JSON.stringify(object, undefined, 2))

  try {
    const oldObject = JSON.parse(readFileSync(filename, 'utf8'))
    write({...oldObject, ...object})
  } catch (_) {
    write(object)
  }
}
