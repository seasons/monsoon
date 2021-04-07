import "module-alias/register"

import { ImageService } from "../../modules/Image/services/image.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const image = new ImageService(ps)
  const imageData = await image.uploadImageFromURL(
    "https://seasons-images.s3.amazonaws.com/email-images/MarcelPlaceholder_800x800.jpg",
    "MarcelPlaceholder.jpg",
    "MarcelPlaceholder.jpg"
  )
  console.log(imageData)
}
run()
