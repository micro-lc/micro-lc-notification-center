const {notifications} = require('../../notifications')

module.exports = (request, response) => {
  const count = notifications.notifications.length
  const unread = notifications.notifications.filter(({readState}) => !readState).length

  response.status(200).send({count, unread})
}
