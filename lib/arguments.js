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

const {argv} = yargs

if (argv.exitStatusCodes) {
  const process = require('process')
  const {enums} = require('./exit-status-names')
  const all = {...enums, unknown: -1 & 0xFF}

  process.stdout.write(
    Object
      .entries(all)
      .reduce((str, [name, code]) => `${str}${name}: ${code}\n`, '')
  )

  process.exit(0)
}

module.exports = yargs
