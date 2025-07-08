import { config } from '../config'
const url = `${config.apiUrl}/bodega`;

function getAllBodega() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

export {
  getAllBodega,
}