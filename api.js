const dataRequest = axios.create({
  baseURL: 'https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json'
})

export const apiGetData = () => dataRequest.get()