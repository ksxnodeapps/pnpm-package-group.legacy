module.exports = (...args) => {
  console.log('spawn', args)
  return {
    on (event, fn) {
      console.log('spawn.on', {event, fn, args})
      setTimeout(() => fn(0, null))
    }
  }
}
