'use strict'
const path = require('path')
const mkdir = require('./mkdir')
const spawn = require('./spawn-process')
const {local, pnpm, shell, quietPnpm, _: rest} = require('./arguments').argv
const exit = require('./exit-status-names').exit.withMessage

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

  const globalPromises = globalPackages.map(name =>
    new Promise(resolve => {
      spawn(
        pnpm,
        ['install', '--global', `${name}@latest`],
        spawnOptions
      ).on(
        'exit',
        (status, signal) =>
          resolve({name, status, signal})
      )
    })
  )

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
      onmkdir: new Promise((resolve, reject) => mkdir(
        wdir,
        error => error ? reject({group, type: 'fs', error}) : resolve({group})
      ))
    }))
    .map(({list, wdir, onmkdir}) =>
      list.map(name => new Promise(
        resolve => onmkdir.then(() =>
          spawn(
            pnpm,
            ['install', `${name}@latest`],
            localSpawnOptions
          ).on(
            'exit',
            (status, signal) =>
              resolve({name, status, signal})
          )
        )
      ))
    )
    .reduce(
      (prev, current) => [...prev, current],
      []
    )

  return Promise.all([
    ...globalPromises,
    ...localPromises
  ]).then(res => {
    res.forEach(
      ({name, status, signal}) =>
        console.info(`${name} → status: ${status || 'OK'} ${signal ? `signal: ${signal}` : ''}`)
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
