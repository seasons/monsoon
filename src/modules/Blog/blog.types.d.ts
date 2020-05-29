import { DateTime } from "@app/prisma/prisma.binding"

export interface BlogPost {
  id: string
  name: string
  slug: string
  imageURL: string
  imageAlt: string
  thumbnailURL: string
  category?: string
  url: string
  tags: string[]
  createdAt: DateTime
  updatedAt: DateTime
  publishedOn: DateTime
}
