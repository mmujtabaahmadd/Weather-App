// ---------- Get HTML elements ----------

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weather-result");
const backgroundImage = document.getElementById("background-image");

// ---------- Nature background images ----------

const backgrounds = {
  sunny:
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2000&q=85",

  cloudy:
    "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=85",

  rainy:
    "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=85",

  stormy:
    "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2000&q=85",

  snowy:
    "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=2000&q=85",

  foggy:
    "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2000&q=85",

  night:
    "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=2000&q=85",
};

// ---------- Convert weather codes into descriptions ----------

function getWeatherDescription(code) {
  if (code === 0) {
    return "Clear sky";
  } else if (code === 1) {
    return "Mainly clear";
  } else if (code === 2) {
    return "Partly cloudy";
  } else if (code === 3) {
    return "Overcast";
  } else if (code === 45 || code === 48) {
    return "Foggy";
  } else if ([51, 53, 55].includes(code)) {
    return "Drizzle";
  } else if ([56, 57].includes(code)) {
    return "Freezing drizzle";
  } else if ([61, 63, 65].includes(code)) {
    return "Rain";
  } else if ([66, 67].includes(code)) {
    return "Freezing rain";
  } else if ([71, 73, 75, 77].includes(code)) {
    return "Snow";
  } else if ([80, 81, 82].includes(code)) {
    return "Rain showers";
  } else if ([85, 86].includes(code)) {
    return "Snow showers";
  } else if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Weather unavailable";
}

// ---------- Choose a weather icon ----------

function getWeatherIcon(code, isDay = 1) {
  if (code === 0) {
    return isDay ? "☀️" : "🌙";
  } else if (code === 1) {
    return isDay ? "🌤️" : "🌙";
  } else if (code === 2) {
    return "⛅";
  } else if (code === 3) {
    return "☁️";
  } else if ([45, 48].includes(code)) {
    return "🌫️";
  } else if ([51, 53, 55, 56, 57].includes(code)) {
    return "🌦️";
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "🌧️";
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  } else if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌍";
}

// ---------- Choose the background ----------

function changeBackground(code, isDay = 1) {
  let background;

  if (isDay === 0 && [0, 1, 2].includes(code)) {
    background = backgrounds.night;
  } else if (code === 0 || code === 1) {
    background = backgrounds.sunny;
  } else if (code === 2 || code === 3) {
    background = backgrounds.cloudy;
  } else if ([45, 48].includes(code)) {
    background = backgrounds.foggy;
  } else if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    background = backgrounds.rainy;
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    background = backgrounds.snowy;
  } else if ([95, 96, 99].includes(code)) {
    background = backgrounds.stormy;
  } else {
    background = backgrounds.cloudy;
  }

  backgroundImage.style.backgroundImage = `url("${background}")`;
}

// ---------- Search for a city ----------

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  message.textContent = "Finding your city's weather...";
  searchButton.disabled = true;
  searchButton.textContent = "Loading...";

  try {
    // Step 1: Find the city's latitude and longitude.

    const geocodingURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geocodingResponse = await fetch(geocodingURL);

    if (!geocodingResponse.ok) {
      throw new Error("Could not search for that city.");
    }

    const geocodingData = await geocodingResponse.json();

    if (!geocodingData.results || geocodingData.results.length === 0) {
      throw new Error("City not found. Check the spelling and try again.");
    }

    const location = geocodingData.results[0];

    // Step 2: Fetch current weather and five-day forecast.

    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=5`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error("Could not get weather data. Please try again.");
    }

    const weatherData = await weatherResponse.json();

    // Step 3: Display all the weather information.

    displayWeather(location, weatherData);

    message.textContent = "";
  } catch (error) {
    message.textContent = error.message;
    weatherResult.hidden = true;
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});

// ---------- Display current weather ----------

function displayWeather(location, weatherData) {
  const current = weatherData.current;
  const code = current.weather_code;
  const isDay = current.is_day;

  // City and location

  document.getElementById("city-name").textContent =
    `${location.name}, ${location.country}`;

  // Current date in the city's local time

  const localDate = new Date(
    `${current.time.replace(" ", "T")}${getTimezoneOffset(weatherData.utc_offset_seconds)}`,
  );

  document.getElementById("current-date").textContent =
    localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  // Temperature

  document.getElementById("temperature").textContent =
    `${Math.round(current.temperature_2m)}°C`;

  // Weather description

  document.getElementById("description").textContent =
    getWeatherDescription(code);

  // Weather icon

  document.getElementById("weather-icon").textContent = getWeatherIcon(
    code,
    isDay,
  );

  // Humidity and wind

  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;

  document.getElementById("wind").textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

  // Background matching the current weather

  changeBackground(code, isDay);

  // Five-day forecast

  displayForecast(weatherData.daily);

  // Reveal the weather cards after data is ready

  weatherResult.hidden = false;
}

// ---------- Convert timezone offset to a date suffix ----------

function getTimezoneOffset(offsetSeconds) {
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const totalMinutes = Math.abs(offsetSeconds) / 60;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

// ---------- Display the five-day forecast ----------

function displayForecast(daily) {
  const forecastList = document.getElementById("forecast-list");

  // Clear the previous city's forecast.

  forecastList.replaceChildren();

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(`${daily.time[i]}T12:00:00`);
    const code = daily.weather_code[i];
    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);

    // Create a forecast card.

    const dayCard = document.createElement("article");
    dayCard.className = "forecast-day";

    const dayName = document.createElement("p");
    dayName.className = "forecast-name";
    dayName.textContent =
      i === 0
        ? "Today"
        : date.toLocaleDateString("en-US", { weekday: "short" });

    const icon = document.createElement("p");
    icon.className = "forecast-icon";
    icon.textContent = getWeatherIcon(code, 1);
    icon.setAttribute("aria-label", getWeatherDescription(code));

    const description = document.createElement("p");
    description.className = "forecast-description";
    description.textContent = getWeatherDescription(code);

    const temperatures = document.createElement("div");
    temperatures.className = "forecast-temperatures";

    const highTemp = document.createElement("span");
    highTemp.textContent = `${high}°`;

    const lowTemp = document.createElement("span");
    lowTemp.className = "forecast-low";
    lowTemp.textContent = `${low}°`;

    temperatures.append(highTemp, lowTemp);
    dayCard.append(dayName, icon, description, temperatures);
    forecastList.appendChild(dayCard);
  }
}
