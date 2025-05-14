// 使用高德开放平台 Web API 获取上海长宁区的天气信息
(function() {
    // 创建天气DOM元素
    const weatherContainer = document.createElement('div');
    weatherContainer.className = 'weather';
    document.querySelector('.app').appendChild(weatherContainer);

    // 获取URL参数
    const urlQuery = geturl(location.href);
    const config = {
        fontSize: +(urlQuery.fs || 7),
        hideWeather: urlQuery.hw === '1'  // 是否隐藏天气
    };

    // 如果设置了隐藏天气，则直接返回
    if (config.hideWeather) {
        return;
    }

    // 设置天气字体大小
    weatherContainer.style.fontSize = (config.fontSize / 4) + 'rem';

    // 修改 API 密钥部分为占位符
    const aMapKey = '__AMAP_KEY__';  // 将在部署时被替换

    // 上海长宁区的城市编码
    const cityCode = '310105';

    // 天气代码与图标映射
    //    const weatherIcons = {
    //        'sunny': '☀️',         // 晴天
    //        'cloudy': '☁️',        // 多云
    //        'overcast': '☁️',      // 阴天
    //        'rainy': '🌧️',        // 雨
    //        'snow': '❄️',          // 雪
    //        'foggy': '🌫️',        // 雾
    //        'haze': '😷',         // 霾
    //        'windy': '🌬️',        // 风
    //    };

    const weatherText = {
        'sunny': '晴',
        'cloudy': '多云',
        'overcast': '阴',
        'rainy': '雨',
        'snow': '雪',
        'foggy': '雾',
        'haze': '霾',
        'windy': '风'
    };

    // 将高德天气代码转换为简单的天气类型
    function mapWeatherCode(code) {
        const codeNum = parseInt(code);
        if (codeNum <= 3) return 'sunny';          // 晴/多云
        if (codeNum <= 9) return 'cloudy';         // 阴/多云
        if (codeNum <= 19) return 'rainy';         // 雨
        if (codeNum <= 29) return 'snow';          // 雪
        if ([30, 31].includes(codeNum)) return 'foggy';  // 雾
        if ([32, 33, 34, 35, 36].includes(codeNum)) return 'haze';  // 霾
        if (codeNum >= 37 && codeNum <= 45) return 'windy';  // 风
        return 'sunny';  // 默认
    }

    // 获取天气信息
    function fetchWeather() {
        // 使用高德天气API查询长宁区天气
        fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${aMapKey}&city=${cityCode}&extensions=base`)
            .then(response => response.json())
            .then(data => {
            if (data.status === '1' && data.lives && data.lives.length > 0) {
                const weather = data.lives[0];
                const weatherType = mapWeatherCode(weather.weather_code || '0');
                const icon = weatherIcons[weatherType] || '☀️';

                // 更新天气显示
                weatherContainer.innerHTML = `
                        ${icon} ${weather.temperature}°C ${weather.weather}
                    `;
            }
        })
            .catch(error => {
            console.error('获取天气信息失败:', error);
            weatherContainer.innerHTML = '天气信息加载失败';
        });
    }

    // 立即获取一次天气
    fetchWeather();

    // 每30分钟更新一次天气信息
    setInterval(fetchWeather, 30 * 60 * 1000);
})();