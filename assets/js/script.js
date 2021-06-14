// variable declaration
var searchCity = $("#searchCity");
var searchButton = $("#searchBtn");
var clearButton = $("#clearBtn");
var currentCity = $("#current-city");
var currentTemperature = $("#temperatureCity");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#windSpeed");
var colorEl = $(".color");
var cityList = [];
var city = "";

// Avoiding duplicate cities
function find(city) {
  for (var i = 0; i < cityList.length; i++) {
    if (city.toUpperCase() === cityList[i]) {
      return -1;
    }
  }
  return 1;
}

//Assigning APIs and units for easiness of usage
var
  APIKey = "4effa21cfed55d3537c02f0573ae370a";
var units = "&units=imperial";

// After the event input occured display the current and forecast weather
function
displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}

// fetch call for the current weather
function currentWeather(city) {

  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey + units;

  fetch(queryURL)
    .then(function (response) {
      return response.json()
        .then(function (response) {

          console.log(response);

          var weathericon = response.weather[0].icon;
          var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

          var date = new Date(response.dt * 1000).toLocaleDateString();

          $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");


          // Display current weather
          var tempF = response.main.temp

          $(currentTemperature).html((tempF).toFixed(2));

          $(currentHumidty).html(response.main.humidity + "%");

          var ws = response.wind.speed;
          var windsmph = (ws).toFixed(1);
          $(currentWSpeed).html(windsmph + "MPH");

          UVIndex(response.coord.lon, response.coord.lat);
          forecast(response.id);
          if (response.cod == 200) {
            cityList = JSON.parse(localStorage.getItem("cityName"));
            console.log(cityList);
            if (cityList == null) {
              cityList = [];
              cityList.push(city.toUpperCase());
              localStorage.setItem("cityName", JSON.stringify(cityList));
              addToList(city);
            } else {
              if (find(city) > 0) {
                cityList.push(city.toUpperCase());
                localStorage.setItem("cityName", JSON.stringify(cityList));
                addToList(city);
              }
            }
          }
        });
    })
}
// UV Index color code
var updateUVIndex = function (val) {

  var currentUvi = $("#uvIndex");
  currentUvi.text(val);
  currentUvi.removeClass();
  if ((val >= 0) && (val <= 2)) {
    currentUvi.addClass("green");
  } else if ((val >= 3) && (val <= 5)) {
    currentUvi.addClass("yellow");
  } else if ((val >= 6) && (val <= 7)) {
    currentUvi.addClass("orange");
  } else if ((val >= 8) && (val <= 10)) {
    currentUvi.addClass("red");
  } else {
    currentUvi.addClass("purple");
  };
};
// Displays UV Iindex
function UVIndex(ln, lt) {

  var quviUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
  // 
  fetch(quviUrl)
    .then(function (response) {
      return response.json()
        .then(function (response) {
          updateUVIndex(response.value);

        });
    });
}
// display the 5 days forecast of the search city.
function forecast(cityid) {
  var dayover = false;
  var qforecastUrl = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey + units;
  fetch(qforecastUrl)
    .then(function (response) {
      return response.json()
        .then(function (response) {
          for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;

            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (tempK).toFixed(2);
            var windS = response.list[((i + 1) * 8) - 1].wind.speed;
            var windM = (windS).toFixed(1);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;
            $("#forecastDate" + i).html(date);
            $("#forecastImg" + i).html("<img src=" + iconurl + ">");
            $("#forecastTemp" + i).html(tempF);
            $("#forecastwind" + i).html(windM + " MPH");
            $("#forecastHumidity" + i).html(humidity + "%");
          }
        });
    });
}
//add the searched city on the search history
function addToList(cityGroup) {
  var listEl = $("<li>" + cityGroup.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", cityGroup.toUpperCase());
  $(".list-group").append(listEl);
}

// display the past search history 
function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}
// Local Storage
function loadlastCity() {
  $("ul").empty();
  var cityList = JSON.parse(localStorage.getItem("cityName"));
  if (cityList !== null) {
    cityList = JSON.parse(localStorage.getItem("cityName"));
    for (i = 0; i < cityList.length; i++) {
      addToList(cityList[i]);
    }
    city = cityList[i - 1];
    currentWeather(city);
  }
}
//Clear the search history from the page if it fills up
function clearHistory(event) {
  event.preventDefault();

  cityList = [];
  localStorage.removeItem("cityName");
  document.location.reload();
}
//On Click Handlers
$("#searchBtn").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clearBtn").on("click", clearHistory);