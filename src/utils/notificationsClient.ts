import axios from 'axios'

const DEFAULT_PAGINATION_LIMIT = 10
async function getNotifications(skip: number): Promise<Notification[]> {
  const {data} = await axios.get<Notification[]>(this.endpoint, {
    headers: this.headers,
    params: {skip, limit: this.limit},
    responseType: 'json'
  })
  return data
}

export {getNotifications, DEFAULT_PAGINATION_LIMIT}