// 使用 OpenWeatherMap API 获取天气信息
            (function() {
                try {
                    // 获取已有的天气DOM元素(在index.html中已创建)
                    const weatherContainer = document.querySelector('.weather') || document.createElement('div');

                    // 如果DOM不存在，则创建
                    if (!document.querySelector('.weather')) {
                        weatherContainer.className = 'weather';
                        document.querySelector('.app').appendChild(weatherContainer);
                    }

                    // 获取URL参数
                    const urlQuery = geturl(location.href);
                    const config = {
                        fontSize: +(urlQuery.fs || 7),
                        hideWeather: urlQuery.hw === '1',     // 是否隐藏天气
                        offlineMode: urlQuery.offline === '1' || true, // 默认离线模式
                        useTextOnly: urlQuery.text === '1' || true,    // 默认仅使用文本
                        customText: urlQuery.wt || '',         // 自定义天气文本
                        staticWeather: urlQuery.sw || '晴 25°C' // 静态天气显示
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

                    // 离线模式或静态天气模式
                    if (config.offlineMode || config.staticWeather) {
                        weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                        return;
                    }

                    // 天气相关配置
                    const openWeatherApiKey = '13e786b2255800d48474a6fdbcd071dc';
                    const lat = '31.2204';
                    const lon = '121.3711';
                    const lang = 'zh_cn';
                    const units = 'metric';

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

                    // 显示加载状态
                    weatherContainer.innerHTML = '获取天气...';

                    // 获取天气的兼容性函数
                    function fetchWeatherCompat() {
                        // 创建一个图片作为伪请求检测网络状态
                        const testImg = new Image();
                        const timestamp = new Date().getTime();
                        testImg.onload = function() {
                            // 如果能加载图片，说明网络连接正常，尝试获取天气
                            tryFetchWeather();
                        };

                        testImg.onerror = function() {
                            // 网络连接不正常，使用静态天气
                            console.log('网络连接失败，使用静态天气');
                            weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                        };

                        // 使用 OpenWeatherMap 的图标作为测试图片
                        testImg.src = "https://openweathermap.org/img/wn/01d.png?_=" + timestamp;

                        // 5秒后如果还没有响应，也使用静态天气
                        setTimeout(function() {
                            if (!weatherContainer.innerHTML || weatherContainer.innerHTML === '获取天气...') {
                                weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                            }
                        }, 5000);
                    }

                    // 尝试获取天气
                    function tryFetchWeather() {
                        try {
                            const xhr = new XMLHttpRequest();

                            // 使用GET方法，Kindle浏览器对某些请求方法支持有限
                            xhr.open('GET', 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + openWeatherApiKey + '&lang=' + lang + '&units=' + units, true);

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
                                            } else {
                                                weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                                            }
                                        } catch (e) {
                                            console.log('天气解析错误');
                                            weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                                        }
                                    } else {
                                        weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                                    }
                                }
                            };

                            // 简化的错误处理
                            xhr.onerror = function() {
                                weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                            };

                            // Kindle浏览器可能不支持timeout属性
                            try {
                                xhr.timeout = 5000;
                                xhr.ontimeout = function() {
                                    weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                                };
                            } catch (e) {
                                // 忽略不支持的属性错误
                            }

                            xhr.send();
                        } catch (e) {
                            console.log('天气请求失败');
                            weatherContainer.innerHTML = config.staticWeather || '晴 25°C';
                        }
                    }

                    // 使用IIFE立即初始化天气
                    (function initWeather() {
                        // 尝试加载一次天气
                        fetchWeatherCompat();

                        // Kindle优化：降低刷新频率，每3小时更新一次
                        try {
                            setInterval(fetchWeatherCompat, 3 * 60 * 60 * 1000);
                        } catch (e) {
                            // 忽略定时器错误
                        }
                    })();

                } catch (e) {
                    // 确保即使模块失败也不影响主时钟功能
                    console.log('天气模块初始化失败');
                }
            })();