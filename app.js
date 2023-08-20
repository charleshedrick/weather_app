"use strict";

const elements = {
  temp: document.querySelector(".temp-value p"),
  shortForecast: document.querySelector(".short-forecast p"),
  location: document.querySelector(".location"),
  notificationt: document.querySelector(".notification"),
  humidity: document.querySelector(".humidity"),
  chanceOfRain: document.querySelector(".chance-of-rain"),
  windSpeed: document.querySelector(".wind-speed"),
  windDirection: "", // Note: This is an empty variable
  timestamp: document.querySelector(".timestamp p"),

  hourlyForecastContainer: document.querySelector(".hourly-forecast"),
};

const weather = {
  temperature: {},
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
  displayNotification("Browser doesn't support geolocation");
}

function setPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  fetchWeather(latitude, longitude);
}

function showError(error) {
  displayNotification(error.message);
}

// INITIAL API
function fetchWeather(latitude, longitude) {
  const apiUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((locationData) => {
      weather.city = locationData.properties.relativeLocation.properties.city;
      weather.state = locationData.properties.relativeLocation.properties.state;

      const hourlyForecastUrl = locationData.properties.forecastHourly;
      return fetch(hourlyForecastUrl);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((hourlyForecastData) => {
      updateWeather(hourlyForecastData);
      updateForecast(hourlyForecastData);
      updateForecastIcon();
      displayWeather();
      console.log(hourlyForecastData);
    })
    // .then((dailyForecastData) => {
    //   updateDailyForecast(dailyForecastData);
    // })
    .catch((error) => {
      handleFetchError(error);
    });
}

function updateWeather(hourlyForecastData) {
  const period = hourlyForecastData.properties.periods[0];
  weather.temperature.value = period.temperature;
  weather.description = period.shortForecast;
  weather.humidity = period.relativeHumidity.value;
  weather.chanceOfRain = period.probabilityOfPrecipitation.value;
  weather.windSpeed = period.windSpeed;
  weather.windDirection = period.windDirection;
  weather.isDaytime = period.isDaytime;

  const iso8601Timestamp = period.startTime;
  const timestamp = new Date(iso8601Timestamp);
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
  };
  weather.timestamp = timestamp.toLocaleString("en-US", options);
}

// HOURLY FORECAST //
function updateForecast(hourlyForecastData) {
  console.log(hourlyForecastData.properties.periods[0].isDaytime);

  for (let i = 1; i < 49; i++) {
    const forecast = hourlyForecastData.properties.periods[i];
    const forecastBox = document.createElement("div");
    forecastBox.classList.add(`hour-${i + 1}`, "hourly-forecast-box");

    // ICON
    const icon = document.createElement("i");
    updateIconFromDescription(forecast.shortForecast, icon);

    // TEMP
    const hourlyTemp = document.createElement("div");
    const tempByHour = hourlyForecastData.properties.periods[i].temperature;
    hourlyTemp.classList.add("hourly-temp");
    hourlyTemp.textContent = `${tempByHour}°`;

    // PROBABILITY OF PRECIPITATION
    const hourlyProbability = document.createElement("div");
    const probability =
      hourlyForecastData.properties.periods[i].probabilityOfPrecipitation.value;

    hourlyProbability.classList.add("hourly-probability");

    // Create the icon element for probability and set its class
    const dropletIcon = document.createElement("i");
    dropletIcon.classList.add("bi", "bi-cloud-rain", "humidity");

    // Set the text content with the icon and probability value
    hourlyProbability.innerHTML = `${dropletIcon.outerHTML} ${probability}%`;

    // RELATIVE HUMIDITY
    const hourlyHumidity = document.createElement("div");
    const humidity =
      hourlyForecastData.properties.periods[i].relativeHumidity.value;

    hourlyHumidity.classList.add("hourly-humidity");

    // Create the icon element for humidity and set its class
    const humidityIcon = document.createElement("i");
    humidityIcon.classList.add("bi", "bi-water", "humidity");

    // Set the text content with the icon and humidity value
    hourlyHumidity.innerHTML = `${humidityIcon.outerHTML} ${humidity}%`;

    // TIME
    const hourlyTime = document.createElement("div");
    const forecastByHour = hourlyForecastData.properties.periods[i].startTime;
    const iso8601Timestamp = forecastByHour;
    const timestamp = new Date(iso8601Timestamp);
    const options = {
      hour: "numeric",
    };
    const formattedTimestamp = timestamp.toLocaleString("en-US", options);
    hourlyTime.classList.add("hourly-time");
    hourlyTime.textContent = formattedTimestamp;

    forecastBox.appendChild(icon);
    forecastBox.appendChild(hourlyTemp);
    forecastBox.appendChild(hourlyProbability);
    forecastBox.appendChild(hourlyHumidity); // Add humidity div
    forecastBox.appendChild(hourlyTime);
    elements.hourlyForecastContainer.appendChild(forecastBox);
  }
}

function updateIconFromDescription(description, iconElement) {
  if (!description) {
    return;
  }
  const keywords = description.toLowerCase().split(" ");
  let iconClass = "bi-question";

  for (const keyword of keywords) {
    if (keywordToIcon[keyword]) {
      iconClass = keywordToIcon[keyword];
      break;
    }
  }

  if (iconElement) {
    iconElement.className = `hourly-forecast-icon bi ${iconClass}`;
  }

  return iconClass;
}

function updateForecastIcon() {
  const iconElementForWeatherIcon = document.querySelector(".weather-icon i");
  const iconClassForWeatherIcon = updateIconFromDescription(
    weather.description
  );
  iconElementForWeatherIcon.className = `bi ${iconClassForWeatherIcon}`;
}

function displayWeather() {
  elements.location.innerHTML = `${weather.city}, ${weather.state}`;
  elements.temp.innerHTML = `${weather.temperature.value}°<span class="fahrenheit-symbol">F</span>`;
  elements.shortForecast.innerHTML = weather.description;
  elements.humidity.innerHTML = `<i class="bi bi-water weather-info-icon"></i><span>${weather.humidity}%</span><div class="small-text">Humidity</div>`;
  elements.chanceOfRain.innerHTML = `<i class="bi bi-cloud-rain weather-info-icon"></i><span>${weather.chanceOfRain}%</span><div class="small-text">Chance of Rain</div>`;
  elements.windSpeed.innerHTML = `<i class="bi bi-wind weather-info-icon"></i> ${weather.windSpeed} ${weather.windDirection}<div class="small-text">Wind Speed</div>`;
  elements.timestamp.innerHTML = `<span>${weather.timestamp}</span>`;
}

function handleFetchError(error) {
  console.error("Fetch error:", error);
  // Handle the error in a user-friendly way
}

// BOOTSTRAP WEATHER ICON MAPPING //
const keywordToIcon = {
  clear: "bi-sun", // Example icons; adjust as needed
  cloudy: "bi-clouds",
  fog: "bi-cloud-fog",
  hail: "bi-cloud-hail",
  haze: "bi-cloud-haze",
  hurricane: "bi-hurricane",
  lightning: "bi-cloud-lightning",
  light: "bi-cloud-drizzle",
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

// BOOTSTRAP WEATHER ICON MAPPING //
const dayKeywordToIcon = {
  clear: "bi-sun", // Example icons; adjust as needed
  cloudy: "bi-clouds",
  fog: "bi-cloud-fog",
  hail: "bi-cloud-hail",
  haze: "bi-cloud-haze",
  hurricane: "bi-hurricane",
  lightning: "bi-cloud-lightning",
  light: "bi-cloud-drizzle",
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

const nightKeywordToIcon = {
  // Nighttime icons
  clear: "bi-moon",
  cloudy: "bi-clouds",
  fog: "bi-cloud-fog",
  // ... (add more nighttime icons)
};

// Extract keywords from description and update the weather icon
function updateWeatherIconFromDescription(description, isDaytime, iconElement) {
  if (!description) {
    return; // Return early if description is undefined or empty
  }

  let iconClass = "bi-question"; // Default icon if no match found
  const keywords = description.toLowerCase().split(" ");

  // Select the appropriate icon mapping based on isDaytime
  const keywordToIcon = isDaytime ? dayKeywordToIcon : nightKeywordToIcon;

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
