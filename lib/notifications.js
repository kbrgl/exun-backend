const axios = require('axios')

const segments = {
  TEST: 'Test Users',
  ALL: 'All',
}

function api(url) {
  return `https://onesignal.com/api/v1/${url}`
}

function push(title, body, segments) {
  const data = {
    app_id: '73966f65-91f6-4d9d-93be-4fd9d4621237',
    contents: { en: body },
    headings: { en: title },
    included_segments: segments,
  }
  const config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: 'Basic ZWQ3YzhlOGYtNzAyOS00ODM2LWJjZTEtNTQ1NGQwY2M5ZDVk',
    },
  }
  return axios.post(api('notifications'), data, config)
}

module.exports = {
  push,
  segments,
}
