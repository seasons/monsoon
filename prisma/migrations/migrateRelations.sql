ALTER TABLE monsoon$dev."ProductVariant" ADD COLUMN "product" VARCHAR(30);
ALTER TABLE monsoon$dev."ProductVariant" ADD CONSTRAINT fk_product
FOREIGN KEY ("product")
REFERENCES monsoon$dev."Product"("id");

UPDATE monsoon$dev."ProductVariant"
SET "product" = monsoon$dev."_ProductToProductVariant"."A"
FROM monsoon$dev."_ProductToProductVariant"
WHERE  monsoon$dev."_ProductToProductVariant"."B" = monsoon$dev."ProductVariant"."id";

DROP TABLE monsoon$dev."_ProductToProductVariant";

-- specific case for product variant
ALTER TABLE monsoon$dev."ProductVariant"
DROP COLUMN "productID"

-- ALso drop the productID column from ProductVariant