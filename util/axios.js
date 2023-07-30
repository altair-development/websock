const axios = require('axios')

const client = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
})

module.exports = {
  get: (url, params) => {
    return client.get(url, params)
  }
}