const {notifications} = require('../../notifications')

module.exports = (request, response) => {
  try {
    const {body: {readState}} = request
    notifications.patchAll(readState)
    response.status(204).send()
  } catch (err) {
    response.status(404).send(err)
  }
}
