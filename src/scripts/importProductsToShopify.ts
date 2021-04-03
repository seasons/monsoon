import { ShopifyService } from "../modules/Shopify/services/shopify.service"
import { PrismaService } from "../prisma/prisma.service"

const SHOPIFY_PRODUCT_CREATE = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
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

const importProductsToShopify = async () => {
  const ps = new PrismaService()
  const shopifyService = new ShopifyService(ps)
  try {
    const products = await ps.binding.query.products(
      {},
      `
      {
        id
        slug
        name
        productFit
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

    console.log(shop.accessToken)

    for (let product of products) {
      const result = await shopifyService.shopifyGraphQLRequest({
        shopName,
        accessToken: shop.accessToken,
        query: SHOPIFY_PRODUCT_CREATE,
        variables: {
          input: {
            title: product.name,
            descriptionHtml: product.description,
            variants: product.variants.map(variant => {
              return {
                sku: variant.sku,
                price: variant.price?.retailPrice || 0,
                options: [variant.internalSize.display, product.color.name],
              }
            }),
            publishDate: product.createdAt,
            productType: product.type,
            images: product.images.map((image, i) => ({
              src: image.url,
              altText: product.name + " " + (i + 1),
            })),
            tags: product.tags.map(tag => tag.name),
          },
        },
      })

      console.log(result)
    }
  } catch (err) {
    console.error(err)
  }
}

importProductsToShopify()
