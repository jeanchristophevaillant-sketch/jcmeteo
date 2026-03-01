import { WeatherData } from "../types";

export async function fetchWeather(lat: number, lng: number, days: number): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,apparent_temperature_max,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&hourly=temperature_2m,apparent_temperature,uv_index,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kn&timezone=auto&forecast_days=${days}`;
  
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&daily=wave_height_max,wave_direction_dominant,wave_period_max&hourly=wave_height,wave_direction,wave_period&timezone=auto&forecast_days=${days}`;

  try {
    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(marineUrl)
    ]);

    const weatherData = await weatherRes.json();
    const marineData = await marineRes.json();

    return {
      daily: weatherData.daily,
      hourly: weatherData.hourly,
      marine: {
        daily: marineData.daily,
        hourly: marineData.hourly
      }
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}
