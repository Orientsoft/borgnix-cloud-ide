
var utils = Object.create(null)

utils.sleep = (ms) => {
  return new Promise((r) => {setTimeout(r, ms)})
}

export default utils
