const {notifications} = require('../../notifications')

module.exports = (_, response) => {
  const count = notifications.notifications.length
  const unread = notifications.notifications.filter(
    ({readState}) => readState === undefined || readState === false
  ).length

  response.status(200).send({count, unread})
}
