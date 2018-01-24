'use strict'

const create = name => ({
  name: String(name).split(' ').join(''),
  version: '0.0.0',
  description: 'Just a transitional directory',
  private: true
})

module.exports = {
  create
}
