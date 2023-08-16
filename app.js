"use strict";

// Select Elements
const tempElement = document.querySelector(".temp-value p");
const descElement = document.querySelector(".temp-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const humidityElement = document.querySelector(".humidity");
const chanceOfRainElement = document.querySelector(".chance-of-rain");
const windSpeedElement = document.querySelector(".wind-speed");
const windDirectionElement = ""; // Note: This is an empty variable
const timestampElement = document.querySelector(".timestamp p");

// App Data
const weather = {
  temperature: {}, // Empty object for temperature data
};

// Check if Browser Supports Geolocation
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = "<p>Browser doesn't support geolocation</p>";
}

// Set User's Position
function setPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  getWeather(latitude, longitude);
}

// Show Error when There's an Issue with the Geolocation Service
function showError(error) {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = `<p>${error.message}</p>`;
}

// Get Weather from Weather.Gov API
function getWeather(latitude, longitude) {
  const apiUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

  fetch(apiUrl)
    // This .then() block handles the response from the first fetch()
    // It receives a Response object as the argument (response)
    // You can extract JSON data from the response using response.json()
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })

    .then((locationData) => {
      //this .then() block receives the HTTP response from the API request, which includes data in JSON format. the argument 'locationData' is assigned the parsed JSON data.
      console.log("location data", locationData);

      weather.city = locationData.properties.relativeLocation.properties.city;
      weather.state = locationData.properties.relativeLocation.properties.state;

      const hourlyForecastUrl = locationData.properties.forecastHourly;
      return fetch(hourlyForecastUrl); //detailed forecast data
    })

    // second api json request for detailed hourly data
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })

    .then((hourlyForecastData) => {
      weather.temperature.value =
        hourlyForecastData.properties.periods[0].temperature;
      weather.description =
        hourlyForecastData.properties.periods[0].shortForecast;
      weather.humidity =
        hourlyForecastData.properties.periods[0].relativeHumidity.value;
      weather.chanceOfRain =
        hourlyForecastData.properties.periods[0].probabilityOfPrecipitation.value;
      weather.windSpeed = hourlyForecastData.properties.periods[0].windSpeed;
      weather.windDirection =
        hourlyForecastData.properties.periods[0].windDirection;
      console.log("hourly forecast data", hourlyForecastData);

      updateWeatherIconFromDescription(weather.description); //can reuse this?

      //TIMESTAMP
      const iso8601Timestamp =
        hourlyForecastData.properties.periods[0].startTime;
      const timestamp = new Date(iso8601Timestamp);
      const options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
      };

      const formattedTimestamp = timestamp.toLocaleString("en-US", options);
      weather.timestamp = formattedTimestamp;

      // HOURLY FORECAST //
      const hourlyForecastContainer =
        document.querySelector(".hourly-forecast");
      console.log(hourlyForecastContainer);

      for (let i = 0; i < 5; i++) {
        const forecast = hourlyForecastData.properties.periods[i];
        //console.log(forecast);
        const forecastBox = document.createElement("div");
        forecastBox.classList.add(`hour-${i + 1}`, "hourly-forecast-box");

        const icon = document.createElement("i");
        //const forecastShort = forecast.shortForecast.toLowerCase();
        //const iconClass = keywordToIcon[forecastShort];
        //icon.classList.add("hourly-forecast-icon", iconClass);

        updateWeatherIconFromDescription(forecast.shortForecast, icon);

        // HOURLY FORECAST TIMESTAMP
        const hourlyTime = document.createElement("div");
        hourlyTime.classList.add("hourly-time");
        hourlyTime.textContent = `${i + 1}hr`;

        // FORECAST BOX //
        forecastBox.appendChild(icon);
        forecastBox.appendChild(hourlyTime);
        hourlyForecastContainer.appendChild(forecastBox);

        // CURRENT FORECAST ICON //
        const iconElementForWeatherIcon =
          document.querySelector(".weather-icon i");
        const iconClassForWeatherIcon = updateWeatherIconFromDescription(
          weather.description
        );
        iconElementForWeatherIcon.className = `bi ${iconClassForWeatherIcon}`;
      }
    })

    .then(() => {
      displayWeather();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

// Display Weather to UI. This function is passed through the above function in a .then()
function displayWeather() {
  locationElement.innerHTML = `<i class="bi bi-geo-alt"></i> <span>${weather.city}, ${weather.state}</span>`;
  tempElement.innerHTML = `${weather.temperature.value}°<span>F</span>`;
  descElement.innerHTML = weather.description;
  humidityElement.innerHTML = `<i class="bi bi-water"></i><span>${weather.humidity}%</span>`;
  chanceOfRainElement.innerHTML = `<i class="bi bi-cloud-rain weather-info-icon"></i><span>${weather.chanceOfRain}%</span>`;
  windSpeedElement.innerHTML = `<i class="bi bi-wind weather-info-icon"></i> ${weather.windSpeed} ${weather.windDirection}`;
  timestampElement.innerHTML = `<span>${weather.timestamp}</span>`;
}

// BOOTSTRAP WEATHER ICONS ////////////////////////
// Mapping between keywords and Bootstrap icon classes
const keywordToIcon = {
  clear: "bi-sun", // Example icons; adjust as needed
  cloudy: "bi-clouds",
  fog: "bi-cloud-fog",
  hail: "bi-cloud-hail",
  haze: "bi-cloud-haze",
  hurricane: "bi-hurricane",
  lightning: "bi-cloud-lightning",
  overcast: "bi-clouds",
  partly: "bi-cloud-sun",
  rain: "bi-cloud-rain",
  showers: "bi-cloud-rain",
  sleet: "cloud-sleet-fill",
  snow: "bi-snow",
  sun: "bi-sun",
  sunny: "bi-sun",
  thunderstorms: "bi-cloud-lightning-rain",
  tropical: "bi-tropical-storm",
};

// Extract keywords from description and update the weather icon
function updateWeatherIconFromDescription(description, iconElement) {
  //console.log("weather icon data from API:", description);
  if (!description) {
    return; // Return early if description is undefined or empty
  }
  const keywords = description.toLowerCase().split(" ");
  //console.log(keywords);
  let iconClass = "bi-question"; // Default icon if no match found

  // MATCH KEY
  for (const keyword of keywords) {
    if (keywordToIcon[keyword]) {
      iconClass = keywordToIcon[keyword];
      //console.log(iconClass);
      break; // Stop searching after the first match
    }
  }

  // Check if iconElement is defined before updating its className
  // HOURLY FORECAST ICON //
  if (iconElement) {
    iconElement.className = `hourly-forecast-icon bi ${iconClass}`;
  }

  return iconClass;
}
