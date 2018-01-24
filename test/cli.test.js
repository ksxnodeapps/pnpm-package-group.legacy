'use strict'
const {resolve, join} = require('path')
const {readFileSync, readdirSync, statSync} = require('fs')
const {spawnSync} = require('child_process')

const setOfLines = string => new Set(
  String(string)
    .split(/\n|\r/)
    .filter(Boolean)
    .map(x => x.trim())
)

describe('The command when everything aside itself works', () => {
  const outputDir = join(__dirname, 'cli-output.tmp')

  const expected = setOfLines(
    readFileSync(resolve(__dirname, 'data/cli-expect.txt'), 'utf8')
  )

  const received = setOfLines(
    spawnSync('node', [
      resolve(__dirname, '../index.js'),
      '--pnpm=echo',
      `--local=${outputDir}`,
      resolve(__dirname, 'data/cli-input.yaml')
    ]).stdout
  )

  it('should print correct messages', () => {
    expect(expected).toEqual(received)
  })

  describe('should create a folder tree', () => {
    describe('whose sub-items', () => {
      const names = readdirSync(outputDir)
      const paths = names.map(x => resolve(outputDir, x))

      it('have correct names', () => {
        expect(new Set(names)).toEqual(new Set(['local1', 'local2']))
      })

      it('are also folders', () => {
        expect(
          paths.every(x => statSync(x).isDirectory())
        ).toBe(true)
      })
    })
  })
})
