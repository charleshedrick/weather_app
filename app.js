"use strict";

// SELECT ELEMENTS
//const iconElement = document.querySelector(".weather-icon"); //need to find a way to select the icons with the NWS data (no easy icon values)
const tempElement = document.querySelector(".temp-value p");
const descElement = document.querySelector(".temp-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");

// APP DATA
const weather = {};

weather.temperature = {
  unit: "celsius",
};

// APP CONSTS AND VARS
const KELVIN = 273;

// CHECK IF BROWSER SUPPORTS GEOLOCATION
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = "<p>Browser doesn't support geolocation";
}

// SET USER'S POSITION
function setPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  getWeather(latitude, longitude);
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH THE GEOLOCAITON SERVICE
function showError(error) {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// GET WEATHER FROM WEATHER.GOV API
function getWeather(latitude, longitude) {
  const apiUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

  // Make the GET request using Fetch API
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    // lat/long data from site is used to fetch local forecast data
    .then((locationData) => {
      const forecastUrl = locationData.properties.forecast;
      console.log(locationData);
      weather.city = locationData.properties.relativeLocation.properties.city;
      weather.state = locationData.properties.relativeLocation.properties.state;
      console.log(locationData.properties.relativeLocation.properties.state);
      return fetch(forecastUrl); //fetches the current locations weather data from the API and formats it to a fetchable api url.
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((forecastData) => {
      // Handle and display the forecast data
      console.log(forecastData);
      // Extract and display the forecast details as needed
      weather.temperature.value =
        forecastData.properties.periods[0].temperature;
      weather.description = forecastData.properties.periods[0].shortForecast;
      console.log(forecastData.properties.periods[0].shortForecast);
      //weather.iconId = data.weather[0].icon;
    })
    .then(() => {
      displayWeather();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

// DISPLAY WEATHER TO UI
function displayWeather() {
  tempElement.innerHTML = `${weather.temperature.value}°<span>F</span>`;
  descElement.innerHTML = weather.description;
  locationElement.innerHTML = `${weather.city}, ${weather.state}`;
}
