import { apiGetData } from './api.js'
import { C3_render } from './chart.js'

let cities = ['台北', '台中', '高雄']

const addForm = document.querySelector('.addPanel__form')
const spotCitySelect = document.querySelector('.form__spotCitySelect')
const searchCitySelect = document.querySelector('.citySearch__select')
const addBtn = document.querySelector('.form__addBtn')
const spotList = document.querySelector('.spotList')

const searchCity = document.querySelector('.citySearch__select')
const ticketCount = document.querySelector('.citySearch__ticketCount')

let data = []
let filterData = []

async function main() {
  try {
    const apiData = await apiGetData()
    data = apiData.data['data']
    console.log('取得api資料: ', data)

    // ----- 初始化 render -----
    add_spotCity(cities)
    search_spotCity(cities)
    render(data)
    ticketCountHandler(data)
    C3_render(cityProportion(data))

    // ----- form 景點地區 -----
    function add_spotCity(data) {
      let option = `
      <option
        value="請選擇請點地區"
        selected
        disabled
        hidden
      >請選擇景點地區</option>
      `
      data.forEach(item => {
        option += `
    <option value="${item}">${item}</option>
    `
      })
      spotCitySelect.innerHTML = option
    }

    // ----- search 地區搜尋 -----
    function search_spotCity(data) {
      let option = `
      <option
        value="地區搜尋"
        selected
        disabled
        hidden
      >地區搜尋</option>
      <option value="全部">全部</option>
      `
      data.forEach(item => {
        option += `
        <option value="${item}">${item}</option>
        `
      })
      searchCitySelect.innerHTML = option
    }

    // ----- render 畫面 -----
    function render(data) {
      let tickets = ''
      data.forEach(item => {
        tickets += `
        <li class="spotList__item">
          <div class="ticket__head">
            <a
              class="ticket__spotImg"
              href="javascript:;"
            >
              <img
                src="${item['imgUrl']}"
                class="ticket__spotImg"
                alt=""
              >
            </a>
            <div class="ticket__city">${item['area']}</div>
            <div class="ticket__score">${item['rate']}</div>
          </div>
          <div class="ticket__body">
            <h3 class="ticket__title">${item['name']}</h3>
            <p class="ticket__introText">${item['description']}</p>
            <div class="ticket__info">
              <div class="ticket__count">
                <img
                  src="img/exclamation-circle-solid.svg"
                  class="ticket__noteIcon"
                  alt=""
                >
                <div class="ticket__countText">剩下最後 ${item['group']} 組</div>
              </div>
              <div class="ticket__price">
                <span class="ticket__unit">TWD</span>
                <div class="ticket__amount">$${parseInt(item['price']).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </li>
        `
      })
      spotList.innerHTML = tickets
    }

    // ----- 新增套票 -----
    function addTicket(e) {
      const imgUrl = document.querySelector('.form__input--img')
      let addObj = {}
      let checkInputStatus = checkInput()
      let checkRateRangeStatus = checkRateRange()
      let checkImgStatus
      checkImgExists(imgUrl)
        .then(() => {
          checkImgStatus = true
          if (checkInputStatus && checkRateRangeStatus && checkImgStatus) {
            addTicketObj(addObj)
            search_spotCity(cities)
            ticketCountHandler(data)
            render(data)
            C3_render(cityProportion(data))
            addForm.reset()
          }
        })
        .catch(() => {
          // e.preventDefault()
          alert('圖片網址無效')
          imgUrl.value = ''
          imgUrl.focus()
          checkImgStatus = false
          return
        })
    }

    // ----- 套票物件新增到 data -----
    function addTicketObj(addObj) {
      const userInputs = document.querySelectorAll('[data-prop]')
      console.log(userInputs)
      userInputs.forEach(input => {
        addObj['id'] = data['id']
        addObj[input.dataset.prop] = input.value
      })
      console.log(addObj)
      data.push(addObj)
    }

    // ----- 檢查 套票星級 是否在 1~10 分 -----
    function checkRateRange() {
      const ticketRate = document.querySelector('.form__input--rate')
      if (ticketRate.value > 10 || ticketRate.value < 1) {
        alert('「套票星級」為1 ~ 10分')
        ticketRate.focus()
        return false
      } else {
        return true
      }
    }

    // ----- 檢查 input 是否有空值 -----
    function checkInput() {
      const userInputs = document.querySelectorAll('[data-prop]')
      let emptyInput = [...userInputs].find(item => item.value === '')
      if (emptyInput) {
        alert(`${emptyInput.dataset.name}未填`)
        emptyInput.focus()
        return false
      } else {
        return true
      }
    }

    // ----- 檢查 圖片連結 是否正常 -----
    function checkImgExists(imgUrl) {
      return new Promise((resolve, reject) => {
        let ImgObj = new Image()
        ImgObj.src = imgUrl.value
        ImgObj.onload = res => {
          resolve(res)
        }
        ImgObj.onerror = err => {
          reject(err)
        }
      })
    }

    // ----- 地區搜尋 -----
    function searchCitySelectHandler(e) {
      filterData = data.filter(item => item['area'] === e.target.value)
      if (e.target.value === '全部') {
        ticketCountHandler(data)
        render(data)
        C3_render(cityProportion(data))
      }
      else {
        ticketCountHandler(filterData)
        render(filterData)
        C3_render(cityProportion(filterData))
      }
      console.log(filterData)
    }

    // ----- 顯示幾筆資料 -----
    function ticketCountHandler(data) {
      ticketCount.textContent = `本次搜尋共 ${data.length} 筆資料`
    }

    console.log('data: ', data)
    console.log('filterData', filterData)

    // ----- 地區比重 -----
    function cityProportion(data) {
      let citiesObj = {}
      data.forEach(item => {
        citiesObj[item['area']] ?
          citiesObj[item['area']] += 1 :
          citiesObj[item['area']] = 1
      })

      console.log('citiesObj: ', citiesObj)
      let C3_data = []
      let areaProps = Object.keys(citiesObj)
      console.log('areaProps: ', areaProps)
      areaProps.forEach(prop => {
        let ary = []
        ary.push(prop)
        ary.push(citiesObj[prop])
        C3_data.push(ary)
      })
      console.log('C3_data: ', C3_data)
      return C3_data
    }

    // ----- 監聽 -----
    addBtn.addEventListener('click', addTicket, false)
    searchCity.addEventListener('change', searchCitySelectHandler, false)

  }
  catch (err) {
    console.error(err)
  }
}

main()