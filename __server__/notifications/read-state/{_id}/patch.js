/* eslint-disable @typescript-eslint/no-var-requires */
const {notifications} = require('../../notifications')

module.exports = (request, response) => {
  try {
    const {
      params: {_id},
      body: {readState},
    } = request
    notifications.patch(_id, readState)
    response.status(204).send()
  } catch (err) {
    response.status(404).send(err)
  }
}
