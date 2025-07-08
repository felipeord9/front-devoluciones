import axios from 'axios';
import { config } from '../config'
const url = `${config.apiUrl}/clients`;
const url2 = `${config.apiUrl2}/clients`

function getAllClients() {
  return fetch(url)
  .then(res => res.json())
  .then(res => res.data)
}

function getAllClientsPOS() {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url2, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(res => res.data)
}

function getOneClient(id) {
  return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

async function createClientPOS(body) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url2, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

async function updateClientPOS(id, body) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url2}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  getAllClients,
  getAllClientsPOS,
  getOneClient,
  createClientPOS,
  updateClientPOS
}