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

export enum ShippoEventType {
  TransactionCreated = "transaction_created",
  TrackUpdated = "track_updated",
}

export type ShippoData = {
  carrier: "ups"
  event: ShippoEventType
  data: {
    tracking_number: string
    tracking_status: {
      object_id: string
      status_date: string
      status_details: string
      status: PackageTransitEventStatus
      substatus: PackageTransitEventSubStatus
      location: {
        city: string
        country: string
        state: string
        zip: string
      }
    }
  }
  transaction?: string
  test?: boolean
}
