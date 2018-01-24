'use strict'

const create = name => ({
  name,
  version: '0.0.0',
  description: 'Just a transitional directory',
  private: true
})

const json = name =>
  JSON.stringify(create(name), undefined, 2)

module.exports = {
  create,
  json
}
