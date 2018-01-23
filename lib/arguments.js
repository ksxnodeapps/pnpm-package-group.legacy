'use strict'
const {resolve} = require('path')
const {readFileSync} = require('fs')
const yargs = require('yargs')
const yaml = require('js-yaml')
const plainYaml = readFileSync(resolve(__dirname, 'arguments.yaml'), 'utf8')
const {usage, example, options, env} = yaml.load(plainYaml)

module.exports = yargs
  .usage(usage)
  .example(example)
  .options(options)
  .env(env)
  .help()
