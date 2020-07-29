import axios from "axios"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const getCityAndStateFromZipCode = async (locationID, zipCode) => {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_KEY}&address=${zipCode}`
    )

    const components = response?.data?.results?.[0]?.address_components
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
    if (!!city && !!state) {
      await ps.client.updateLocation({
        where: { id: locationID },
        data: {
          city,
          state,
        },
      })
    } else {
      console.log("not updated: ", locationID)
      console.log("results: ", response?.data?.results)
    }
  }

  try {
    const locations = await ps.binding.query.locations(
      { where: { AND: [{ city: null }, { zipCode_not: null }] } },
      `
    {
        id
        city
        state
        zipCode
    }
    `
    )

    locations.forEach(async location => {
      await getCityAndStateFromZipCode(location.id, location.zipCode)
    })
    console.log("locations length", locations.length)
  } catch (err) {
    console.log(err)
  }
}

run()
