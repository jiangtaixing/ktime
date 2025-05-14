// 使用 OpenWeatherMap API 获取天气信息
(function() {
    try {
        // 创建天气DOM元素
        const weatherContainer = document.createElement('div');
        weatherContainer.className = 'weather';
        document.querySelector('.app').appendChild(weatherContainer);

        // 获取URL参数
        const urlQuery = geturl(location.href);
        const config = {
            fontSize: +(urlQuery.fs || 7),
            hideWeather: urlQuery.hw === '1',     // 是否隐藏天气
            offlineMode: urlQuery.offline === '1', // 离线模式
            useTextOnly: urlQuery.text === '1',    // 仅使用文本
            customText: urlQuery.wt || ''          // 自定义天气文本
        };

        // 如果设置了隐藏天气，则直接返回
        if (config.hideWeather) {
            return;
        }

        // 设置天气字体大小
        weatherContainer.style.fontSize = (config.fontSize / 4) + 'rem';

        // 自定义天气文本模式
        if (config.customText) {
            weatherContainer.innerHTML = decodeURIComponent(config.customText);
            return;
        }

        // 离线模式直接显示静态内容
        if (config.offlineMode) {
            weatherContainer.innerHTML = '晴 25°C';
            return;
        }

        // OpenWeatherMap API 密钥，将在部署时替换
        const openWeatherApiKey = '13e786b2255800d48474a6fdbcd071dc';

        // 上海长宁区的经纬度
        const lat = '31.2204';
        const lon = '121.3711';

        // 设置语言为中文
        const lang = 'zh_cn';

        // 设置温度单位为摄氏度
        const units = 'metric';

        // 天气代码与文字映射
        const weatherText = {
            'Clear': '晴',
            'Clouds': '多云',
            'Drizzle': '小雨',
            'Rain': '雨',
            'Thunderstorm': '雷雨',
            'Snow': '雪',
            'Mist': '雾',
            'Smoke': '烟雾',
            'Haze': '霾',
            'Dust': '尘',
            'Fog': '雾',
            'Sand': '沙',
            'Ash': '灰',
            'Squall': '大风',
            'Tornado': '龙卷风'
        };

        // 天气图标 (仅在非文本模式下使用)
        const weatherIcons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Drizzle': '🌦️',
            'Rain': '🌧️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Smoke': '🌫️',
            'Haze': '🌫️',
            'Dust': '🌫️',
            'Fog': '🌫️',
            'Sand': '🌫️',
            'Ash': '🌫️',
            'Squall': '💨',
            'Tornado': '🌪️'
        };

        // 显示加载状态
        weatherContainer.innerHTML = '加载天气中...';

        // 获取天气信息
        function fetchWeather() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&lang=${lang}&units=${units}`, true);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    try {
                        if (xhr.status === 200) {
                            const response = JSON.parse(xhr.responseText);
                            if (response && response.main && response.weather && response.weather.length > 0) {
                                const temperature = Math.round(response.main.temp);
                                const weatherType = response.weather[0].main;

                                // 根据配置决定使用文本还是图标
                                const weatherSymbol = config.useTextOnly ?
                                    (weatherText[weatherType] || weatherType) :
                                    (weatherIcons[weatherType] || weatherType);

                                weatherContainer.innerHTML = `${weatherSymbol} ${temperature}°C`;
                            } else {
                                weatherContainer.innerHTML = '晴 25°C';
                            }
                        } else {
                            weatherContainer.innerHTML = '晴 25°C';
                        }
                    } catch (e) {
                        console.error('天气数据解析错误:', e);
                        weatherContainer.innerHTML = '晴 25°C';
                    }
                }
            };

            xhr.onerror = function() {
                console.error('天气请求失败');
                weatherContainer.innerHTML = '晴 25°C';
            };

            xhr.timeout = 10000; // 10秒超时
            xhr.ontimeout = function() {
                console.error('天气请求超时');
                weatherContainer.innerHTML = '晴 25°C';
            };

            try {
                xhr.send();
            } catch (e) {
                console.error('天气请求发送错误:', e);
                weatherContainer.innerHTML = '晴 25°C';
            }
        }

        // 立即获取一次天气
        fetchWeather();

        // 每60分钟更新一次天气信息 (减少更新频率以适应Kindle)
        setInterval(fetchWeather, 60 * 60 * 1000);
    } catch (e) {
        console.error('天气模块初始化失败:', e);
        // 确保即使失败也不影响主时钟功能
    }
})();