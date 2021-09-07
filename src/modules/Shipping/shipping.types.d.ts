export interface ShippoShipment {
  object_id?: string
  address_from: any
  address_to: any
  parcels: any
  extra?: any
  rates?: Array<ShippoRate>
}
export interface ShippoTransaction {
  object_id?: string
  label_url: string
  tracking_number: string
  tracking_url_provider: string
  messages: any[]
  formatted_error?: string
  status: string
}

export type ShippoRate = {
  amount: number
  shipment: string
  servicelevel: {
    name: string
    token: string
    terms: string
  }
}

export interface CoreShippoAddressFields {
  name?: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
}
