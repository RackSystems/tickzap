import axios from 'axios'

const client = axios.create({
  baseURL: process.env.EVOLUTION_URL,
  headers: {
    'Content-Type': 'application/json',
    apikey: process.env.EVOLUTION_API_KEY as string,
  }
})

export default client
