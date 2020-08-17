import { Injectable } from "@nestjs/common"
import axios from "axios"

@Injectable()
export class ShippingUtilsService {
  async getCityAndStateFromZipCode(zipCode) {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_KEY}&address=${zipCode}`
    )

    const components = response?.data?.results?.[0].address_components
    let state = ""
    let city = ""
    components.forEach(component => {
      component.types.forEach(type => {
        if (type === "sublocality" && !!component.long_name) {
          city = component.long_name
        }
        if (type === "locality" && !city) {
          city = component.long_name
        }
        // Occasionally there is no locality or sublocality and only a neighborhood for city
        if (type === "neighborhood" && !city) {
          city = component.long_name
        }
        if (type === "administrative_area_level_1") {
          state = component.long_name
        }
      })
      if (!city && response?.data?.results?.[0]?.postcode_localities?.[0]) {
        city = response?.data?.results?.[0]?.postcode_localities?.[0]
      }
    })
    return { city, state }
  }
}
