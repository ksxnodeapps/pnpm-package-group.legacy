'use strict'
/* eslint prefer-promise-reject-errors: 'off' */

const path = require('path')
const {writeFileSync} = require('fs-force')
const spawn = require('./spawn-process')
const {local, pnpm, shell, quietPnpm, _: rest} = require('./arguments').argv
const exit = require('./exit-status-names').exit.withMessage
const manifest = require('./package-json-template')

if (rest.length > 1) {
  exit('arguments', 'Too many arguments.')
}

require('./input')(rest).then(plain => plain
  ? require('js-yaml').safeLoad(plain)
  : exit('empty-input', 'Input is empty.')
).then(object => {
  const {global: globalPackages, ...localPackages} = object

  if (!Array.isArray(globalPackages)) {
    return exit('schema', 'Field global is not an array')
  }

  const spawnOptions = {
    shell,
    ...quietPnpm ? {} : {stdio: 'inherit'}
  }

  const globalPromise = new Promise(resolve => {
    console.info('[INFO] (global) ' + globalPackages.join(', '))

    spawn(
      pnpm,
      [
        'install',
        '--global',
        ...globalPackages.map(x => `${x}@latest`)
      ],
      spawnOptions
    ).then(
      ({status, signal}) =>
        resolve({list: globalPackages, status, signal})
    )
  })

  const localPromises = Object
    .entries(localPackages)
    .map(([group, list]) => [
      group,
      list,
      path.resolve(local, group)
    ])
    .map(([group, list, wdir]) => ({
      group,
      list,
      wdir,
      onmkdir: new Promise((resolve, reject) => {
        try {
          writeFileSync(
            path.resolve(wdir, 'package.json'),
            manifest.json(group)
          )
          resolve({group, list, wdir})
        } catch (error) {
          reject({group, list, wdir, type: 'fs', error})
        }
      })
    }))
    .map(({list, group, wdir, onmkdir}) => {
      const localSpawnOptions = {
        cwd: wdir,
        ...spawnOptions
      }

      return new Promise(resolve => {
        console.info(`[INFO] (local: ${group}) ${list.join(', ')}`)

        spawn(
          pnpm,
          [
            'install',
            ...list.map(x => `${x}@latest`)
          ],
          localSpawnOptions
        ).then(
          ({status, signal}) =>
            resolve({list, status, signal})
        )
      })
    })

  return Promise.all([
    globalPromise,
    ...localPromises
  ]).then(res => {
    res.forEach(
      ({list, status, signal}) => console.info([
        `status: ${status === 0 ? 'OK' : status}`,
        ...signal ? [`signal: ${signal}`] : [],
        `list: ${list.join(', ')}`
      ].join(' — '))
    )

    exit(res.some(x => x.status) ? 'other' : 'success')
  })
}).catch(
  reason => {
    const {type, error} = reason
    switch (type) {
      case 'fs':
        return exit('filesystem', error)
      case 'stdin':
        return exit('stdin', error)
      default:
        return exit('other', reason)
    }
  }
)
