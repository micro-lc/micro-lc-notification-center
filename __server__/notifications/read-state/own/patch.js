const {notifications} = require('../../notifications')

module.exports = (request, response) => {
  try {
    const {
      body: {readState},
    } = request
    notifications.patchAll(readState)
    response.sendStatus(204)
  } catch (err) {
    response.status(404).send(err)
  }
}
