const {notifications} = require('../notifications')

module.exports = (request, response) => {
  response.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  const {query} = request
  if (query && query.skip && query.limit) {
    const skip = Number.parseInt(query.skip)
    const limit = Number.parseInt(query.limit)
    if (
      Number.isNaN(skip) ||
      (!Number.isNaN(skip) && skip < 0) ||
      skip.toString() !== query.skip
    ) {
      response.status(404).send({
        status: 404,
        error: 'Bad request',
        message: '`skip` must be a non-negative integer number',
      })
    } else if (
      Number.isNaN(limit) ||
      (!Number.isNaN(limit) && limit < 0) ||
      limit.toString() !== query.limit
    ) {
      response.status(404).send({
        status: 404,
        error: 'Bad request',
        message: '`limit` must be a non-negative integer number',
      })
    } else {
      const {lang} = query
      response
        .set({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        })
        .status(200)
        .send(notifications.slice(skip, skip + limit).map((n) => {
          if(lang) {
            const translated = {...n}
            const {title, content} = n
            if(title[lang]) {
              translated.title = title[lang]
            }
            if(content[lang]) {
              translated.content = content[lang]
            }

            return translated
          }
          
          return n
        }))
    }
    return
  }

  response.status(404).send({
    status: 404,
    error: 'Bad request',
    message: 'Missing pagination skip and/or limit params',
  })
}
