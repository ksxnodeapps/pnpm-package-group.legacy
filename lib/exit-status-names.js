'use strict'

const names = require('fs')
  .readFileSync(
    require('path')
      .resolve(__dirname, 'data/exit-status-names.list'),
    'utf8'
  )
  .split(/\r|\n/)
  .filter(Boolean)
  .filter(x => !/^#/.test(x))

const enums = require('number-enum').create(names)

const get = name =>
  name in enums ? enums[name] : -1

const exit = (name = 'success') =>
  require('process').exit(get(name))

exit.withMessage = (name, message) => {
  const code = enums[name]

  if (message) {
    if (code === 0) {
      console.info('[SUCCESS]', message)
    } else {
      console.error('[ERROR]', `(${name})`, message)
    }
  }

  exit(name)
}

module.exports = {
  names,
  enums,
  get,
  exit,
  __proto__: enums
}
