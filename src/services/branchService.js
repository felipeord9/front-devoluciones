import axios from 'axios'
import { config } from '../config'

const url2 = `${config.apiUrl2}/branches`

function getAllBranchesPOS() {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url2, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })
    .then(res => res.json())
    .then(res => res.data)
}

async function createBranchPOS(body) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url2, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

async function updateBranchPOS(id, body) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url2}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  getAllBranchesPOS,
  createBranchPOS,
  updateBranchPOS
}