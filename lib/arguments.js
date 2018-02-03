'use strict'
const {resolve} = require('path')
const {readFileSync} = require('fs')
const yaml = require('js-yaml')
const plainYaml = readFileSync(resolve(__dirname, 'data/arguments.yaml'), 'utf8')
const {usage, example, options, env} = yaml.load(plainYaml)

const yargs = require('yargs')
  .usage(usage)
  .example(example)
  .options(options)
  .env(env)
  .help()

module.exports = yargs
