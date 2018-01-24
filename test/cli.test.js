'use strict'
const {resolve, join} = require('path')
const {readFileSync, readdirSync, statSync} = require('fs')
const {spawnSync} = require('child_process')
const fsForce = require('fs-force')

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

  const testSuccess = description => {
    const received = setOfLines(
      spawnSync('node', [
        resolve(__dirname, '../index.js'),
        '--pnpm=echo',
        `--local=${outputDir}`,
        resolve(__dirname, 'data/cli-input.yaml')
      ]).stdout
    )

    describe(description, () => {
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

          paths.forEach(x => describe(`has ${x}`, () => {
            it('which is a folder', () => {
              expect(statSync(x).isDirectory()).toBe(true)
            })

            describe('has a package.json', () => {
              const file = resolve(x, 'package.json')

              it('which is a file', () => {
                expect(statSync(file).isFile()).toBe(true)
              })

              it('which valid JSON code', () => {
                const object = JSON.parse(readFileSync(file, 'utf8'))
                expect(typeof object).toBe('object')
                expect(typeof object.name).toBe('string')
                expect(object.version).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/)
                expect(object).toHaveProperty('private', true)
              })
            })
          }))
        })
      })
    })
  }

  fsForce.deleteSync(outputDir)
  testSuccess('when there was no output dir in the first place')
  fsForce.writeFileSync(outputDir, 'it is a file')
  testSuccess('when there output path was a file instead of a directory')
  testSuccess('when the directory is at right place')
})
