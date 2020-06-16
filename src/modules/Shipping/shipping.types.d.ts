import {
  PackageTransitEventStatus,
  PackageTransitEventSubStatus,
} from "@app/prisma"

export interface ShippoShipment {
  address_from: any
  address_to: any
  parcels: any
  extra?: any
}
export interface ShippoTransaction {
  label_url: string
  tracking_number: string
  tracking_url_provider: string
  messages: any[]
  formatted_error?: string
  status: string
}
