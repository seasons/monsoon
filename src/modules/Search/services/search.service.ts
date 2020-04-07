import { Client } from "@elastic/elasticsearch"
import { Injectable } from "@nestjs/common"

const {
  ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD,
} = process.env

@Injectable()
export class SearchService {
  elasticsearch = !!ELASTICSEARCH_URL
    ? new Client({
        node: ELASTICSEARCH_URL,

        auth: {
          username: ELASTICSEARCH_USERNAME ?? "elastic",
          password: ELASTICSEARCH_PASSWORD,
        },
      })
    : null
}
