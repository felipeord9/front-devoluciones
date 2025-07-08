const { config } = require('../config')

const url = `${config.apiUrl}/agencies`;

function getAllAgencies() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

export {
  getAllAgencies
}