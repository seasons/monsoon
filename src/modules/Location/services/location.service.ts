import { Injectable } from "@nestjs/common"
import { Location } from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"
import axios from "axios"

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  getEmoji(weatherCode, datetime, sunrise, sunset) {
    // Match OWM Conditions (http://openweathermap.org/weather-conditions)
    const weatherCodeGroup = Math.floor(weatherCode / 100)
    switch (weatherCodeGroup) {
      // Thunder
      case 2:
        return "0x26C8" // Drizzle
      case 3:
        return "0x1F327"
      // Rain
      case 5:
        return "0x1F327"
      // Snow
      case 6:
        return "0x2744" // Fog
      case 7:
        return "0x1F32B"
      case 8:
        // Cloudy
        if (weatherCode === 802) return "0x2601"
        const currentHour = new Date(datetime)
        if (
          currentHour >= new Date(sunrise) &&
          currentHour <= new Date(sunset)
        ) {
          // Sun
          return "0x2600"
        } else {
          // Moon
          return "0x1F311"
        }
      case 9:
        // Tornado
        if (weatherCode === 900) return "0x1F32A"
        // Wind
        if (weatherCode === 905) return "0x1F32C"
        // Wind
        if (weatherCode <= 955) return "0x1F32C"
        // Extreme
        return null
      default:
        return null
    }
  }

  async getWeatherForLocation(location: Location) {
    // https://openweathermap.org/current#zip
    const zipCode = location.zipCode
    const countryCode = "us"
    const api = `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=imperial`

    return axios
      .get(api)
      .then(response => {
        console.log(response)
        return response.data
      })
      .catch(error => {
        console.log("error", error)
        return null
      })
  }

  async weather(locationID: string) {
    const location = await this.prisma.client.location({ id: locationID })
    const weatherData = (await this.getWeatherForLocation(location)) as any
    const weather = weatherData?.weather?.[0]?.id
    const sunrise = weatherData?.sys.sunrise
    const sunset = weatherData?.sys.sunset
    const datetime = weatherData?.dt
    const emoji = this.getEmoji(weather, datetime, sunrise, sunset)
    const temperature =
      weatherData?.main?.temp && Math.floor(weatherData?.main?.temp)
    const temperatureMax =
      weatherData?.main?.temp_max && Math.floor(weatherData?.main?.temp_max)
    const temperatureMin =
      weatherData?.main?.temp_min && Math.floor(weatherData?.main?.temp_min)

    return {
      id: datetime?.toString() ?? Math.random().toString(),
      temperature,
      temperatureMax,
      temperatureMin,
      emoji,
      sunset,
      sunrise,
    }
  }
}
