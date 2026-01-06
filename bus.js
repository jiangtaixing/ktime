// Security Configuration
window._AMapSecurityConfig = {
  securityJsCode: "fa416ba189380b2f1f86d59012656d2f",
};

// Application Logic
const BusApp = {
  config: {
    key: "76f0e6ecd6c4922f1e5ab591230c2002",
    version: "2.0",
    plugins: ["AMap.Transfer", "AMap.StationSearch"],
    busLine: "141路",
    startStation: "仙霞西路北祥路",
    endStation: "福泉路泉口路",
  },

  // 缓存坐标，避免重复查询
  cache: {
    startCoords: null,
    endCoords: null
  },

  init() {
    // Key Check with debug info
    console.log("API Key check:", {
      keyValue: this.config.key,
      keyLength: this.config.key.length,
      isPlaceholder: this.config.key === "76f0e6ecd6c4922f1e5ab591230c2002",
      isTooShort: this.config.key.length < 20
    });
    
    if (this.config.key === "76f0e6ecd6c4922f1e5ab591230c2002" || this.config.key.length < 20) {
      const debugInfo = `Key长度: ${this.config.key.length}, 值: ${this.config.key.substring(0, 10)}...`;
      console.error("Key validation failed:", debugInfo);
      this.renderError(`配置错误：API Key 未被正确替换。请检查 GitHub Secrets 设置。<br><small>调试信息: ${debugInfo}</small>`);
      return;
    }

    if (!window.AMapLoader) {
      console.error("AMapLoader not found");
      this.renderError("地图加载器丢失。");
      return;
    }

    AMapLoader.load({
      key: this.config.key,
      version: this.config.version,
      plugins: this.config.plugins,
    })
      .then((AMap) => {
        this.AMap = AMap;
        // 初始化时先获取坐标，成功后再开启轮询
        this.initLocations().then(() => {
          this.queryRoute();
          // Refresh every 5 minutes (只查路线，不查站点)
          setInterval(() => this.queryRoute(), 5 * 60 * 1000);
        });
      })
      .catch((e) => {
        console.error("Map load failed", e);
        // Catch specific key errors if possible, though AMap usually logs to console
        this.renderError("地图初始化失败。如果看到 'Error key'，请检查 Key 和安全密钥是否匹配。");
      });
  },

  // 新增：初始化站点坐标（只执行一次）
  async initLocations() {
    try {
      this.renderLoading();
      this.cache.startCoords = await this.getStationLocation(this.config.startStation);
      this.cache.endCoords = await this.getStationLocation(this.config.endStation);
      
      if (!this.cache.startCoords || !this.cache.endCoords) {
        this.renderError("无法找到站点位置信息。");
        return Promise.reject("Invalid stations");
      }
      return Promise.resolve();
    } catch (e) {
      this.renderError("站点初始化失败。");
      return Promise.reject(e);
    }
  },

  async queryRoute() {
    try {
      // 使用缓存的坐标
      const { startCoords, endCoords } = this.cache;
      if (!startCoords || !endCoords) return;

      // Query Forward: Start -> End
      const forwardRoute = await this.getBusRoute(startCoords, endCoords);
      
      // Query Backward: End -> Start
      const backwardRoute = await this.getBusRoute(endCoords, startCoords);

      this.render(forwardRoute, backwardRoute);
    } catch (error) {
      console.error("Query failed", error);
      // 仅在首次渲染失败时显示错误，轮询失败保持旧数据或静默失败
      if (!document.querySelector('.bus-route')) {
          this.renderError("公交信息查询失败。");
      }
    }
  },

  getStationLocation(keyword) {
    return new Promise((resolve, reject) => {
      const stationSearch = new this.AMap.StationSearch({
        pageIndex: 1,
        pageSize: 1,
        city: "上海",
      });

      stationSearch.search(keyword, (status, result) => {
        if (status === "complete" && result.stationInfo && result.stationInfo.length > 0) {
          resolve(result.stationInfo[0].location);
        } else {
          resolve(null);
        }
      });
    });
  },

  getBusRoute(start, end) {
    return new Promise((resolve, reject) => {
      const transfer = new this.AMap.Transfer({
        city: "上海",
        policy: this.AMap.TransferPolicy.LEAST_TIME, // Optimize for time
        nightflag: true, // Include night buses if applicable
      });

      transfer.search(start, end, (status, result) => {
        if (status === "complete" && result.plans && result.plans.length > 0) {
          // Filter for target bus line
          const plan = result.plans.find(p => 
            p.segments.some(s => 
              s.transit_mode === "BUS" && s.instruction.includes(this.config.busLine)
            )
          ) || result.plans[0]; 
          
          resolve(plan);
        } else {
          resolve(null);
        }
      });
    });
  },

  formatTime(seconds) {
    const min = Math.ceil(seconds / 60);
    return `${min}分钟`;
  },

  render(forwardPlan, backwardPlan) {
    const container = document.getElementById("bus-container");
    if (!container) return;

    let html = `<div class="bus-info">`;

    // Helper to render one direction
    const renderDirection = (title, from, to, plan) => {
      if (!plan) {
        return `<div class="bus-route">
                  <h3>${title}</h3>
                  <p>暂无线路信息</p>
                </div>`;
      }
      
      const time = this.formatTime(plan.time);
      
      const busSegment = plan.segments.find(s => s.transit_mode === "BUS");
      const lineName = busSegment ? busSegment.instruction.split('(')[0] : "公交"; 
      
      return `<div class="bus-route">
                <h3>${title} (${lineName})</h3>
                <p>从 ${from} 到 ${to}</p>
                <p>预计耗时: <span class="highlight">${time}</span></p>
                <p class="sub-text">全程约 ${(plan.distance / 1000).toFixed(1)}公里</p>
              </div>`;
    };

    html += renderDirection("去程", this.config.startStation, this.config.endStation, forwardPlan);
    html += renderDirection("返程", this.config.endStation, this.config.startStation, backwardPlan);

    html += `</div>`;
    container.innerHTML = html;
  },

  renderLoading() {
    const container = document.getElementById("bus-container");
    // Only show loading if empty to avoid flicker
    if (container && !container.hasChildNodes()) {
        container.innerHTML = '<div class="loading">正在查询公交信息...</div>';
    }
  },

  renderError(msg) {
    const container = document.getElementById("bus-container");
    if (container) container.innerHTML = `<div class="error" style="color: red; font-size: 0.8rem; line-height: 1.4;">${msg}</div>`;
  }
};

// Init on load
BusApp.init();
