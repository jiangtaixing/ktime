"use strict";
const apiKey = process.env.weather_key; 
const weatherElement = document.querySelector('.weather');

function fetchWeather() {
  fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=310105&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const live = data.lives[0];
      const weatherDescription = live.weather;
      const temperature = live.temperature;
      const windDirection = live.winddirection;
      const windPower = live.windpower;
      const humidity = live.humidity;

      weatherElement.innerHTML = `
        <p>天气: ${weatherDescription}</p>
        <p>温度: ${temperature}°C</p>
        <p>风向: ${windDirection}</p>
        <p>风力: ${windPower}</p>
        <p>湿度: ${humidity}%</p>
      `;
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      weatherElement.innerHTML = '无法获取天气信息';
    });
}

fetchWeather();
setInterval(fetchWeather, 1800000); // 每30分钟更新一次天气信息
