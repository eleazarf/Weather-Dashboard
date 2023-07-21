// Initial page function
function initPage() {
    // elements from search box
    const cityEl = document.getElementById("search-city");
    const searchEl = document.getElementById("search-button");
    const clearEl = document.getElementById("clear-history");
    const nameEl = document.getElementById("city-name");
    
    // elements for weather display
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentDescription = document.getElementById("Description");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");
    
    // weather history and forecast
    const historyEl = document.getElementById("history");
    var fivedayEl = document.getElementById("fiveday-header");
    var todayweatherEl = document.getElementById("today-weather");
    
    // local storage
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    // Assigning API key to APIKey
    const APIKey = "fbc6546596b5c65b58d1e10abe56245e";

    // getting the weather from openweathermap.org
    function getWeather(cityName) {
        
        // Perform a GET request to the OpenWeather API to retrieve the current weather data.
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric" + "&appid=" + APIKey;
        
        // This line initiates a GET request to the API specified in the queryURL variable using Axios
        axios.get(queryURL)
            .then(function (response) {
                // ensures that the element becomes visible
                todayweatherEl.classList.remove("d-none");

                // Decode the API response and show the current weather details.
                const currentDate = new Date(response.data.dt * 1000); // timestamp is multiplied by 1000 because JavaScript works with milliseconds, while the API likely returns the timestamp in seconds. 
                
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                nameEl.innerHTML = response.data.name + " (" + day + "/" + month + "/" + year + ") ";

                let weatherPic = response.data.weather[0].icon;
                currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                currentPicEl.setAttribute("alt", response.data.weather[0].description);

                currentTempEl.innerHTML = "Temperature (High/Low): " + Math.ceil(response.data.main.temp) + " &#176C (" + Math.ceil(response.data.main.temp_max) + "&#176/" + Math.ceil(response.data.main.temp_min) + "&#176)";
                currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " KPH";
                currentDescription.innerHTML = "Weather Conditions: " + response.data.weather[0].description;
                
                // Get UV Index
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                
                axios.get(UVQueryURL)
                .then(function (response) {
                  const UVIndex = response.data[0].value;
                  const badgeColor = UVIndex < 4 ? "success" : UVIndex < 8 ? "warning" : "danger";
                  currentUVEl.innerHTML = `UV Index: <span class="badge badge-${badgeColor}">${UVIndex}</span>`;
                });
                
                // Get 5 day forecast for this city
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=metric" + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        fivedayEl.classList.remove("d-none");
                        
                        //  Parse response to display forecast for next 5 days
                        const forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastDay + "/" + forecastMonth + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);

                            // Icon for current weather
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + Math.ceil(response.data.list[forecastIndex].main.temp) + " &#176C (" + Math.ceil(response.data.list[forecastIndex].main.temp_min) + "&#176C/" + Math.ceil(response.data.list[forecastIndex].main.temp_max) + "&#176C)";
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    })
            });
    }

    // Get history from local storage if any
    searchEl.addEventListener("click", function () {
        const searchTerm = cityEl.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    // Clear History button
    clearEl.addEventListener("click", function () {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    })

    function renderSearchHistory() {
        historyEl.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click", function () {
                getWeather(historyItem.value);
            })
            historyEl.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
    
}

initPage();