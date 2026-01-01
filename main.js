const filterRegionContainer = document.querySelector('.dropdown-list')
const countryList = document.querySelector('.country-list')
const countryDetailsPage = document.querySelector('.details-page')
const regionArray = []
const allCountries = []
const searchInput = document.querySelector('.search-input')
const dropDownHeader = document.querySelector('.dropdown-header')
const dropDownSvg = document.querySelector('.dropdown-svg')

const dropDownList = document.querySelector('.dropdown-list')
const selectedRegion  = document.querySelector('.dropdown-selected')
const themeToggleBtn = document.querySelector('.theme-toggle')
const rootEl = document.documentElement
const crescent = document.querySelector('.theme-toggle svg')
//To keep the countries state
let validCountries;

let isDark = localStorage.getItem('theme')


//Check local storage is set to dark mode
if (isDark === "dark") {
    rootEl.classList.add("dark")
    rootEl.classList.remove("light")
} else if(isDark === "light") {
    rootEl.classList.add("light")
    rootEl.classList.remove("dark")
}


//Functions



//Get only the initial data displayed on the page
async function getData() {
  try {
    let response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population')
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`)
    }
    let countries = await response.json()
    allCountries.push(...countries)
    await renderPage(allCountries)
    validCountries = allCountries
    
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

getData()



async function countryDetails(countryName){

      try{
 let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`)
    }
   let data = await response.json()
   let country = data[0]
    
  await renderCountryDetails(country)
      } catch(error) {
          console.error("Error fetching data:", error);
      }
      
}

async function renderPage(allCountries) {
countryList.innerHTML = ""
filterRegionContainer.innerHTML = ""
    allCountries.forEach(country => {
     //Push thevregions to display in the dropdown
      regionArray.push(country.region)
      let card = document.createElement('article')
      card.classList.add("country-card")
      card.innerHTML = `
      <div class="country-flag" style="background-image:url(${country.flags.svg})"></div>
      <div class="country-info">
        <h2 class="country-name">${country.name.official}</h2>
        <ul class="country-stats">
          <li><span class="label">Population:</span> ${country.population.toLocaleString()}</li>
          <li><span class="label">Region:</span> ${country.region}</li>
          <li><span class="label">Capital:</span> ${country.capital}</li>
        </ul>
      </div>
      `
      countryList.appendChild(card)
    })
     //Making sure there's no duplicate in the //regionArray
    const uniqueRegion = [...new Set(regionArray)]

    uniqueRegion.forEach(region => {
        let regions = document.createElement('li')
        regions.innerHTML = `
        <li class="dropdown-item">${region}</li>
          `
          filterRegionContainer.appendChild(regions)
    })
}

async function renderCountryDetails(country) {
      // Turning the alpha codes into country names
      let bordersArray = []
      if (country.borders) {
      
          try{
          //Used Promise.all to run the fetch requests in parallel
              let responses = await Promise.all(
                  country.borders.map(border => {
                      return fetch(`https://restcountries.com/v3.1/alpha/${border}`)
                  })
              )
              
   let datas = await Promise.all(
       responses.map(response => {
       if (!response.ok) {
           throw new Error ('Border fetch failed')
       }
           return response.json()
       })
   )
   bordersArray = datas.map(value => {
       return value[0].name.common
   })
          } catch(error) {
              alert(error.message)
          }
      
          
      }
      
      
      countryDetailsPage.innerHTML = `
      <button class="back-button">
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="24" height="24" 
         fill="none" 
         viewBox="0 0 24 24" 
         stroke="currentColor" 
         stroke-width="2" 
         class="icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    <span>Back</span>
  </button>


<div class="country-details">

  <div class="country-details-flag" style="background-image:url(${country.flags.svg})"></div>

 
  <div class="country-details-info">
    <h2 class="country-details-name">${country.name.official}</h2>

   
    <div class="country-details-lists">
      <ul class="details-list">
        <li><span class="label">Native Name:</span> ${country.name.common || 'N/A'}</li>
        <li><span class="label">Population:</span> ${country.population.toLocaleString()  || 'N/A'}</li>
        <li><span class="label">Region:</span> ${country.region || 'N/A'}</li>
        <li><span class="label">Sub Region:</span> ${country.subregion || 'N/A'}</li>
        <li><span class="label">Capital:</span> ${country.capital || 'N/A'}</li>
      </ul>

      <ul class="details-list">
        <li><span class="label">Top Level Domain:</span> ${country.tld || 'N/A'}</li>
        
        <li><span class="label">Currencies:</span> ${Object.values(country.currencies || {})[0].name || 'N/A'}</li>
        <li><span class="label">Languages:</span>${Object.values(country.languages || {}).join(', ')}</li>
      </ul>
    </div>

   
    <div class="border-countries">
      <h3 class="border-countries-title">Border countries:</h3>
      <div class="border-countries-list">
        ${
            bordersArray.length > 0 ? bordersArray.map(border => 
                `<button class="border-country"><span >${border}</span></button>`
            ) .join('') : `<button class="border-country"><span>No borders</span></button>`
        }
      </div>
    </div>
  </div>
</div>
      `
      
      countryDetailsPage.style.display = 'block'
      document.body.classList.add("no-scroll");
     //Used Object.values since the keys returned were different 
}





//Event Listeners

document.addEventListener('click', (e) => {
  let backBtn = e.target.closest('.back-button')
  if (!backBtn) {
    return
  }
    const detailsPage = backBtn.closest('.details-page')
    detailsPage.style.display = "none"
    document.body.classList.remove("no-scroll");
})

searchInput.addEventListener('input', (e) => {
    const searchValue = searchInput.value.toLowerCase();

   
   let filterCountries = validCountries.filter(country =>  country.name.official.toLowerCase().includes(searchValue)
    )
    renderPage(filterCountries)
  });
  
  
  
  dropDownSvg.addEventListener('click', () => {
      dropDownHeader.classList.toggle('active')
  })
  
 
 
  document.addEventListener('click', (e) => {
      let dropDownRegion = e.target.closest('.dropdown-item')
      if (dropDownRegion) {
          selectedRegion.innerHTML = `
          <div class="dropdownOptionDiv">
              <span>${dropDownRegion.textContent}</span> 
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-cancel">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>
          </div>
          `
          dropDownHeader.classList.remove('active')
          validCountries = allCountries.filter(country => country.region.toLowerCase() === dropDownRegion.textContent.toLowerCase())
          renderPage(validCountries)
      }
  })
  
  
  document.addEventListener('click', (e) => {
      let dropdownCancel = e.target.closest('.dropdown-cancel')
      if (dropdownCancel) {
          selectedRegion.innerHTML = `
          <span class="dropdown-selected">Filter by region</span>`
          validCountries = allCountries
          renderPage(validCountries)
      }
  })
  
  document.addEventListener('click', async (e) => {
    let card = e.target.closest('.country-card')
    if (card) {
        const name = card.querySelector('.country-name')
        await countryDetails(name.textContent)
    }
} )


document.addEventListener('click', async (e) => {
    let borderBtn = e.target.closest('.border-country')
    if (borderBtn) {
        try{
        let borderName = borderBtn.textContent
        if ( borderName === "No borders") {
            return
        }
            let response = await fetch(`https://restcountries.com/v3.1/name/${borderName}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`)
    }
   let data = await response.json()
   let country = data[0]
   renderCountryDetails(country)
        } catch(error) {
            console.error("Error fetching alpha code:", error);
        }
    }
})
  
  //theme toggle
themeToggleBtn.addEventListener('click', () => {
    if (rootEl.classList.contains('dark')) {
        rootEl.classList.remove('dark')
        rootEl.classList.add('light')
        localStorage.setItem('theme','light')
    }else {
        rootEl.classList.add('dark')
        rootEl.classList.remove('light')
        localStorage.setItem('theme','dark')
    }
})



