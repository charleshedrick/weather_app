"use strict";

// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
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
  let latitude = position.coords.latutude;
  let longitude = position.coords.longitude;

  getWeather(latitude, longitude);
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH THE GEOLOCAITON SERVICE
function showError(error) {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

/*
function getWeather(latitude, longitude) {
  let api = `https://api.weather.gov/points/{lat=${latitude}},{lon=${longitude}}`;
}

fetch(api) .then(function(response)) {
    let data = response.json();
    return data;
};
*/
