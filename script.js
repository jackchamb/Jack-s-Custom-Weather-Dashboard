// Personal API key + setting variables + error variable for fetch and check for error
var myAPI = "b0e8de5960aa9eb59aca1652fe6defa4";
var thisCity = "";
var previousCity = "";

var Errors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}
// Shows current weather using API 
var getconditions = (event) => {
    let city = $('#search-city').val();
    thisCity= $('#search-city').val();
    // API URL linked to personal key to show data
    let APIURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(APIURL)
    .then(Errors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        //shows the city in LS
        saveCity(city);
        $('#no-searches').text("");
        //weather icon that changes based on locations weather
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        let currentTimeUTC = response.dt;
        //uses moment.js to show live timer
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        loadcurrentcity();
        getweekdayForecast(event);
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + myAPI;
        fetch(uvURL)
        .then(Errors)
        .then((response) => {
            return response.json();
        })
        //Generates UV index 
        .then((response) => {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVar"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVar').attr("class", "uvindex-good");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVar').attr("class", "uvindex-okay");
            } else if (uvIndex>=8){
                $('#uvVar').attr("class", "uvindex-bad");
            }
        });
    })
}
// Shows the weekdays forecast on browser + start of fetch linking to API
var getweekdayForecast = (event) => {
    let city = $('#search-city').val();
    let APIURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(APIURL)
        .then (Errors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        let weekdayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="weekdayForecastUl" class="d-inline-flex flex-wrap ">`;
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                weekdayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        weekdayForecastHTML += `</div>`;
        $('#weekday-forecast').html(weekdayForecastHTML);
    })
}
// Saves user inputed cites + loads the searched city
var saveCity = (newCity) => {
    let cityRemain = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityRemain = true;
            break;
        }
    }
    if (cityRemain === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

var loadcurrentcity = () => {
    $('#search-results').empty();
    if (localStorage.length===0){
        if (previousCity){
            $('#search-city').attr("value", previousCity);
        } else {
            $('#search-city').attr("value", "Edinburg");
        }
    } else {
        let previousCityKey="cities"+(localStorage.length-1);
        previousCity=localStorage.getItem(previousCityKey);
        $('#search-city').attr("value", previousCity);
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (thisCity===""){
                thisCity=previousCity;
            }
            if (city === thisCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#search-results').prepend(cityEl);
        }
        
    }
    
}

$('#search-location').on("click", (event) => {
event.preventDefault();
thisCity = $('#search-city').val();
getconditions(event);
});

$('#search-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    thisCity=$('#search-city').val();
    getconditions(event);
});

loadcurrentcity();

getconditions();