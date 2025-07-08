import axios from 'axios'
import { config } from '../config'
const url = `${config.apiUrl}/products`;
const url2 = `${config.apiUrl2}/products`;

function getAllProducts() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

function getAllProductsPg() {
  return fetch(url2)
    .then(res => res.json())
    .then(res => res.data)
}

function getOneProduct(id) {
  return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

const createProduct = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
      
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const updateProduct = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(url2, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  getAllProducts,
  getAllProductsPg,
  getOneProduct,
  createProduct,
  updateProduct,
}