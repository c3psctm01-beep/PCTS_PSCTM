/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: weather-widget.js - Live Weather Forecast & Substation Engineering Advisory
 * ==============================================================================
 */

(function () {
    'use strict';

    const weatherCache = {};

    /**
     * แปลงรหัสสภาพอากาศ WMO Weather Code เป็นข้อความ ไอคอน และระดับความรุนแรง
     */
    function parseWmoWeather(code) {
        if (code === 0) {
            return { desc: 'ท้องฟ้าแจ่มใส แดดจัด', icon: 'fa-sun', color: '#f59e0b', type: 'clear' };
        }
        if ([1, 2].includes(code)) {
            return { desc: 'มีเมฆบางส่วน แดดส่อง', icon: 'fa-cloud-sun', color: '#f59e0b', type: 'fair' };
        }
        if (code === 3) {
            return { desc: 'เมฆมาก ท้องฟ้ามืดครึ้ม', icon: 'fa-cloud', color: '#64748b', type: 'cloudy' };
        }
        if ([45, 48].includes(code)) {
            return { desc: 'มีหมอกลง ทัศนวิสัยลดลง', icon: 'fa-smog', color: '#94a3b8', type: 'fog' };
        }
        if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) {
            return { desc: 'มีฝนตกปรอยๆ ถึงปานกลาง', icon: 'fa-cloud-rain', color: '#3b82f6', type: 'rain' };
        }
        if ([82, 65].includes(code)) {
            return { desc: 'ฝนตกหนักต่อเนื่อง', icon: 'fa-cloud-showers-heavy', color: '#2563eb', type: 'heavy_rain' };
        }
        if ([95, 96, 99].includes(code)) {
            return { desc: 'พายุฝนฟ้าคะนองและลมกระโชกแรง', icon: 'fa-cloud-bolt', color: '#dc2626', type: 'thunderstorm' };
        }
        return { desc: 'สภาพอากาศปกติ', icon: 'fa-cloud-sun', color: '#64748b', type: 'fair' };
    }

    /**
     * ดึงข้อมูลพยากรณ์อากาศสดจาก Open-Meteo API
     */
    window.fetchSubstationWeather = async function (lat, lng) {
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

        const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
        const now = Date.now();
        if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp < 30 * 60 * 1000)) {
            return weatherCache[cacheKey].data;
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Weather API error: ${resp.status}`);
            const data = await resp.json();

            weatherCache[cacheKey] = {
                timestamp: now,
                data: data
            };
            return data;
        } catch (err) {
            console.warn('[WeatherWidget] Failed to fetch weather:', err);
            return null;
        }
    };

    /**
     * เรนเดอร์วิดเจ็ตสภาพอากาศและคำแนะนำวิศวกรรมสำหรับโครงการสถานีไฟฟ้า
     */
    window.renderSubstationWeatherWidget = async function (project, containerId = 'substationWeatherWidgetContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const p = project || window.currentProjectViewData;
        if (!p) {
            container.innerHTML = '';
            return;
        }

        let lat = p.latitude ? parseFloat(p.latitude) : null;
        let lng = p.longitude ? parseFloat(p.longitude) : null;

        if ((!lat || !lng) && typeof window.resolveProjectCoordinates === 'function') {
            const resolved = window.resolveProjectCoordinates(p);
            if (resolved) {
                lat = resolved.lat;
                lng = resolved.lng;
            }
        }

        if (!lat || !lng) {
            container.innerHTML = `
                <div class="weather-card-empty">
                    <i class="fa-solid fa-cloud-sun"></i>
                    <span>ยังไม่มีข้อมูลพิกัด GPS สำหรับดึงพยากรณ์อากาศหน้างาน</span>
                </div>
            `;
            return;
        }

        // Loading state
        container.innerHTML = `
            <div class="weather-card-loading">
                <i class="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบสภาพอากาศหน้างานสถานีไฟฟ้าแบบเรียลไทม์...
            </div>
        `;

        const weatherData = await window.fetchSubstationWeather(lat, lng);
        if (!weatherData || !weatherData.current) {
            container.innerHTML = `
                <div class="weather-card-empty">
                    <i class="fa-solid fa-cloud-exclamation"></i>
                    <span>ไม่สามารถเชื่อมต่อสถานีตรวจอากาศได้ในขณะนี้</span>
                </div>
            `;
            return;
        }

        const cur = weatherData.current;
        const daily = weatherData.daily;
        const weatherInfo = parseWmoWeather(cur.weather_code);
        const rainChance = daily?.precipitation_probability_max?.[0] || 0;
        const temp = Math.round(cur.temperature_2m);
        const feelTemp = Math.round(cur.apparent_temperature);
        const humidity = cur.relative_humidity_2m;
        const windSpeed = Math.round(cur.wind_speed_10m);

        // คำแนะนำวิศวกรรมงานก่อสร้างสถานีไฟฟ้า กฟภ.
        let advisoryText = '';
        let advisoryIcon = 'fa-circle-check';
        let advisoryClass = 'advisory-good';

        if (weatherInfo.type === 'thunderstorm' || rainChance >= 75 || cur.precipitation > 2) {
            advisoryClass = 'advisory-danger';
            advisoryIcon = 'fa-triangle-exclamation';
            advisoryText = `⚠️ <strong>สภาพอากาศวิกฤต:</strong> โอกาสฝนตกหนัก ${rainChance}% เสี่ยงเกิดพายุฟ้าคะนอง ให้ระงับการทำงานบนที่สูง เครนยกอุปกรณ์หนัก และงานเทคอนกรีตฐานรากสถานีทันที`;
        } else if (rainChance >= 45 || cur.precipitation > 0 || windSpeed >= 28) {
            advisoryClass = 'advisory-warning';
            advisoryIcon = 'fa-triangle-exclamation';
            advisoryText = `⚠️ <strong>เฝ้าระวังสภาพอากาศ:</strong> โอกาสเกิดฝน ${rainChance}% และความเร็วลม ${windSpeed} km/h ควรคลุมผ้าใบกันน้ำบริเวณตู้ Marshalling Kiosk และเตรียมเครื่องสูบน้ำลานหม้อแปลง`;
        } else if (temp >= 38) {
            advisoryClass = 'advisory-heat';
            advisoryIcon = 'fa-temperature-high';
            advisoryText = `☀️ <strong>อากาศร้อนจัด:</strong> อุณหภูมิสัมผัส ${feelTemp}°C ให้ผู้ปฏิบัติงานระวังโรคลมแดด (Heatstroke) พักดื่มน้ำเป็นระยะ และตรวจสอบการขยายตัวของสายส่งไฟฟ้า`;
        } else {
            advisoryClass = 'advisory-good';
            advisoryIcon = 'fa-shield-halved';
            advisoryText = `✅ <strong>ทัศนวิสัยดีมาก:</strong> ท้องฟ้าเปิด เหมาะสำหรับการติดตั้งหม้อแปลงไฟฟ้า 115 kV งานลากสายเคเบิลคอนโทรล และงาน Individual Test`;
        }

        // แปลงพยากรณ์ล่วงหน้า 3 วัน
        const dayNames = ['วันนี้', 'พรุ่งนี้', 'มะรืนนี้'];
        const forecastItemsHtml = (daily?.time || []).slice(0, 3).map((dStr, idx) => {
            const wCode = daily.weather_code[idx];
            const wObj = parseWmoWeather(wCode);
            const maxT = Math.round(daily.temperature_2m_max[idx]);
            const minT = Math.round(daily.temperature_2m_min[idx]);
            const prob = daily.precipitation_probability_max[idx];

            return `
                <div class="weather-forecast-day">
                    <span class="day-label">${dayNames[idx] || dStr}</span>
                    <i class="fa-solid ${wObj.icon}" style="color: ${wObj.color}; font-size: 20px;"></i>
                    <span class="day-temp">${maxT}° / ${minT}°</span>
                    <span class="day-rain ${prob >= 50 ? 'rain-high' : ''}"><i class="fa-solid fa-droplet"></i> ${prob}%</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="substation-weather-card">
                <div class="weather-card-top">
                    <div class="weather-current-main">
                        <div class="weather-icon-large" style="color: ${weatherInfo.color};">
                            <i class="fa-solid ${weatherInfo.icon}"></i>
                        </div>
                        <div>
                            <div class="weather-temp-wrap">
                                <span class="weather-temp-val">${temp}°C</span>
                                <span class="weather-feel">รู้สึกเหมือน ${feelTemp}°C</span>
                            </div>
                            <div class="weather-desc-text">${weatherInfo.desc}</div>
                        </div>
                    </div>

                    <div class="weather-metrics-grid">
                        <div class="weather-metric-item">
                            <i class="fa-solid fa-droplet" style="color: #3b82f6;"></i>
                            <div>
                                <span class="met-label">โอกาสเกิดฝน</span>
                                <strong class="met-val">${rainChance}%</strong>
                            </div>
                        </div>
                        <div class="weather-metric-item">
                            <i class="fa-solid fa-wind" style="color: #10b981;"></i>
                            <div>
                                <span class="met-label">ความเร็วลม</span>
                                <strong class="met-val">${windSpeed} km/h</strong>
                            </div>
                        </div>
                        <div class="weather-metric-item">
                            <i class="fa-solid fa-water" style="color: #6366f1;"></i>
                            <div>
                                <span class="met-label">ความชื้นสัมพัทธ์</span>
                                <strong class="met-val">${humidity}%</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3-Day Forecast Strip -->
                <div class="weather-forecast-strip">
                    ${forecastItemsHtml}
                </div>

                <!-- Engineering Advisory Banner -->
                <div class="weather-advisory-banner ${advisoryClass}">
                    <i class="fa-solid ${advisoryIcon}"></i>
                    <div>${advisoryText}</div>
                </div>
            </div>
        `;
    };

})();
