// 使用 OpenWeatherMap API 获取天气信息
(function() {
    // 确保DOM已加载完成
    setTimeout(function() {
        try {
            // 不创建新元素，只使用已存在的元素
            const weatherContainer = document.querySelector('.weather');
            if (!weatherContainer) {
                console.log('天气容器不存在');
                return; // 如果找不到容器，直接退出
            }

            // 获取URL参数
            const urlQuery = geturl(location.href);
            const config = {
                fontSize: +(urlQuery.fs || 7),
                hideWeather: urlQuery.hw === '1',
                offlineMode: urlQuery.offline === '1', // 修正：只在参数为1时启用离线模式
                customText: urlQuery.wt || '',
                staticWeather: urlQuery.sw || '晴 25°C'
            };

            // 如果设置了隐藏天气，则直接返回
            if (config.hideWeather) {
                weatherContainer.style.display = 'none';
                return;
            }

            // 设置天气字体大小
            weatherContainer.style.fontSize = (config.fontSize / 4) + 'rem';

            // 自定义天气文本模式
            if (config.customText) {
                try {
                    weatherContainer.innerHTML = decodeURIComponent(config.customText);
                } catch (e) {
                    weatherContainer.innerHTML = config.customText;
                }
                return;
            }

            // 默认使用静态天气，避免API请求问题
            weatherContainer.innerHTML = config.staticWeather || '晴 25°C';

            // 如果设置了离线模式，则不进行网络请求
            if (config.offlineMode) {
                return;
            }

            // 天气相关配置
            const openWeatherApiKey = '13e786b2255800d48474a6fdbcd071dc';
            const lat = urlQuery.lat || '31.209155';
            const lon = urlQuery.lon || '121.563913';

            // 简化的天气代码映射
            const weatherText = {
                'Clear': '晴',
                'Clouds': '多云',
                'Drizzle': '小雨',
                'Rain': '雨',
                'Thunderstorm': '雷雨',
                'Snow': '雪',
                'Mist': '雾',
                'Fog': '雾'
            };

            // 获取天气的兼容性函数
            function fetchWeatherCompat() {
                // 先显示静态天气，确保始终有内容显示
                if (!weatherContainer.innerHTML || weatherContainer.innerHTML === '获取天气...') {
                    weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                }

                // 创建一个图片作为伪请求检测网络状态
                const testImg = new Image();
                testImg.onload = tryFetchWeather;
                testImg.onerror = function() {
                    // 网络不通，不执行进一步操作
                };
                // 使用可靠的测试图片URL
                testImg.src = "https://openweathermap.org/img/wn/01d.png?" + new Date().getTime();
            }

            // 尝试获取天气
            function tryFetchWeather() {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat +
                             '&lon=' + lon + '&appid=' + openWeatherApiKey +
                             '&lang=zh_cn&units=metric', true);

                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                try {
                                    const response = JSON.parse(xhr.responseText);
                                    if (response && response.main && response.weather && response.weather.length > 0) {
                                        const temperature = Math.round(response.main.temp);
                                        const weatherType = response.weather[0].main;
                                        const weatherDesc = weatherText[weatherType] || weatherType;
                                        weatherContainer.innerHTML = weatherDesc + ' ' + temperature + '°C';
                                    }
                                } catch (e) {
                                    // 错误处理：保持现有显示内容
                                }
                            }
                        }
                    };

                    xhr.send();
                } catch (e) {
                    // 保持现有显示内容
                }
            }

            // 延迟3秒后尝试获取天气，确保时钟先加载完成
            setTimeout(fetchWeatherCompat, 3000);

            // 降低刷新频率至3小时一次
            try {
                setInterval(fetchWeatherCompat, 3 * 60 * 60 * 1000);
            } catch (e) {
                // 忽略定时器错误
            }

        } catch (e) {
            // 确保即使模块失败也不影响主时钟功能
            console.log('天气模块初始化失败');
        }
    }, 2000); // 延迟2秒执行，确保时钟已初始化
})();