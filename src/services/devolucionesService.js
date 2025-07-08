import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/return`;

const findDevolucones = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findDevoluconesBySeller = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/seller/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findDevoluconesByCreator = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/creator/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findDevoluconesByClientes = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/find/clientes`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findDevoluconesByAgencias = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/find/agencias`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findDevoluconesAutorizadas = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/find/autorizadas`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findDevoluconByAgency = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/co/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findOneDevolucion = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findFilteredDevolucones = (init, final) => {
  return fetch(`${url}?init=${init}&final=${final}`)
    .then((data) => data.json())
    .then((data) => data)
}

export const verifyTokenById = async (token) => {
  const localToken = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/verify/${token}`, {
    headers: {
      Authorization: `Bearer ${localToken}`
    }
  })
  return data
}

const createDevolucon = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url, {
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

const updateDevolucon = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createItem = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url, {
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

const deleteDevolucion = (id) => {
  return fetch(`${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => res);
};

export { 
  findDevolucones,
  findDevoluconesBySeller,
  findDevoluconByAgency,
  findFilteredDevolucones, 
  findDevoluconesByAgencias,
  findDevoluconesByCreator,
  findDevoluconesByClientes,
  findDevoluconesAutorizadas,
  createDevolucon,
  updateDevolucon,
  createItem, 
  deleteDevolucion 
};
