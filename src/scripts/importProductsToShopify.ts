import qs from "querystring"

import { ImageService } from "../modules/Image/services/image.service"
import { ShopifyService } from "../modules/Shopify/services/shopify.service"
import { PrismaService } from "../prisma/prisma.service"

const SHOPIFY_PRODUCT_CREATE = `
  mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
      }
      shop {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

const resizeImage = (url: string, sizeName, passedOptions) => {
  try {
    const options = {
      retina: true,
      fm: "webp",
      ...passedOptions,
    }

    const { retina, ...remainingOptions } = options
    const size = {
      w: 560,
    }
    const params: any = {
      ...remainingOptions,
      ...(options.retina && size.w ? { w: size.w * 2 } : {}),
    }

    if (/seasons-images\./.test(url)) {
      return (
        url.replace(`seasons-images.s3.amazonaws.com`, `seasons-s3.imgix.net`) +
        "?" +
        qs.stringify(params)
      )
    }

    return (
      url.replace(
        `seasons-images-staging.s3.amazonaws.com`,
        `seasons-s3-staging.imgix.net`
      ) +
      "?" +
      qs.stringify(params)
    )
  } catch (err) {
    console.error(err)
  }
}

const importProductsToShopify = async () => {
  const ps = new PrismaService()
  const shopifyService = new ShopifyService(ps)

  try {
    const products = await ps.binding.query.products(
      {
        where: {
          brand: {
            brandCode: "NANU",
          },
        },
      },
      `
      {
        id
        slug
        name
        productFit
        retailPrice
        category {
          id
          name
        }
        description
        retailPrice
        color {
          id
          name
        }
        secondaryColor {
          id
          name
        }
        brand {
          id
          slug
          name
          logo
          since
          websiteUrl
        }
        images {
          url
        }
        type
        tags {
          name
        }
        variants {
          sku
          price {
            retailPrice
          }
          internalSize {
            id
            display
          }
        }
      }
    `
    )

    const shopName = "seasons-staging.myshopify.com"
    const shop = await ps.client.externalShopifyIntegration({
      shopName,
    })

    for (let product of products) {
      const images = product.images.map(image => {
        return resizeImage(image.url, "Large", {
          fm: "jpg",
          retina: true,
        })
      })
      const requestData = {
        shopName,
        accessToken: shop.accessToken,
        query: SHOPIFY_PRODUCT_CREATE,
        variables: {
          input: {
            title: product.name,
            vendor: product.brand.name,
            descriptionHtml: product.description,
            variants: product.variants.map(variant => {
              return {
                sku: variant.sku,
                price: product.retailPrice || 0,
                options: [variant.internalSize.display, product.color.name],
                imageSrc: product.images?.[0].url,
                inventoryItem: {
                  cost: variant.price?.retailPrice || 0,
                  tracked: true,
                },
                inventoryQuantities: {
                  locationId: "gid://shopify/Location/60950184045",
                  availableQuantity: 1,
                },
              }
            }),
            publishDate: product.createdAt,
            productType: product.type,
            images: images.map((image, i) => ({
              src: image,
              altText: product.name + " " + (i + 1),
            })),
            tags: product.tags.map(tag => tag.name),
          },
          media: images.map((image, i) => ({
            originalSource: image,
            alt: product.name + " " + (i + 1),
            mediaContentType: "IMAGE",
          })),
        },
      }
      const result = await shopifyService.shopifyGraphQLRequest(requestData)

      console.log(result)
    }
  } catch (err) {
    console.error(err)
  }
}

importProductsToShopify()
