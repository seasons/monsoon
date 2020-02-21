import { Client } from "@elastic/elasticsearch"

const {
  ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD,
} = process.env

export const elasticsearch = !!ELASTICSEARCH_URL
  ? new Client({
      node: ELASTICSEARCH_URL,

      auth: {
        username: ELASTICSEARCH_USERNAME ?? "elastic",
        password: ELASTICSEARCH_PASSWORD,
      },
    })
  : null
