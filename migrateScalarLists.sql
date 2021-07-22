ALTER TABLE monsoon$dev."BlogPost" ADD COLUMN "tags" text[];

UPDATE monsoon$dev."BlogPost"
    SET tags = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."BlogPost_tags"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."BlogPost"."id";

DROP TABLE monsoon$dev."BlogPost_tags";


ALTER TABLE monsoon$dev."Brand" ADD COLUMN "styles" text[];

UPDATE monsoon$dev."Brand"
    SET styles = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."Brand_styles"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."Brand"."id";

DROP TABLE monsoon$dev."Brand_styles";


ALTER TABLE monsoon$dev."Collection" ADD COLUMN "descriptions" text[];

UPDATE monsoon$dev."Collection"
    SET descriptions = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."Collection_descriptions"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."Collection"."id";

DROP TABLE monsoon$dev."Collection_descriptions";


ALTER TABLE monsoon$dev."Collection" ADD COLUMN "placements" text[];

UPDATE monsoon$dev."Collection"
    SET placements = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."Collection_placements"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."Collection"."id";

DROP TABLE monsoon$dev."Collection_placements";


ALTER TABLE monsoon$dev."Product" ADD COLUMN "outerMaterials" text[];

UPDATE monsoon$dev."Product"
    SET outerMaterials = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."Product_outerMaterials"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."Product"."id";

DROP TABLE monsoon$dev."Product_outerMaterials";


ALTER TABLE monsoon$dev."Product" ADD COLUMN "innerMaterials" text[];

UPDATE monsoon$dev."Product"
    SET innerMaterials = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."Product_innerMaterials"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."Product"."id";

DROP TABLE monsoon$dev."Product_innerMaterials";


ALTER TABLE monsoon$dev."Product" ADD COLUMN "styles" text[];

UPDATE monsoon$dev."Product"
    SET styles = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."Product_styles"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."Product"."id";

DROP TABLE monsoon$dev."Product_styles";


ALTER TABLE monsoon$dev."ProductSeason" ADD COLUMN "wearableSeasons" text[];

UPDATE monsoon$dev."ProductSeason"
    SET wearableSeasons = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."ProductSeason_wearableSeasons"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."ProductSeason"."id";

DROP TABLE monsoon$dev."ProductSeason_wearableSeasons";


ALTER TABLE monsoon$dev."ShopifyShop" ADD COLUMN "scope" text[];

UPDATE monsoon$dev."ShopifyShop"
    SET scope = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."ShopifyShop_scope"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."ShopifyShop"."id";

DROP TABLE monsoon$dev."ShopifyShop_scope";


ALTER TABLE monsoon$dev."PhysicalProductQualityReport" ADD COLUMN "damageTypes" text[];

UPDATE monsoon$dev."PhysicalProductQualityReport"
    SET damageTypes = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."PhysicalProductQualityReport_damageTypes"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."PhysicalProductQualityReport"."id";

DROP TABLE monsoon$dev."PhysicalProductQualityReport_damageTypes";


ALTER TABLE monsoon$dev."SmsReceipt" ADD COLUMN "mediaUrls" text[];

UPDATE monsoon$dev."SmsReceipt"
    SET mediaUrls = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."SmsReceipt_mediaUrls"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."SmsReceipt"."id";

DROP TABLE monsoon$dev."SmsReceipt_mediaUrls";


ALTER TABLE monsoon$dev."User" ADD COLUMN "roles" text[];

UPDATE monsoon$dev."User"
    SET roles = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."User_roles"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."User"."id";

DROP TABLE monsoon$dev."User_roles";


ALTER TABLE monsoon$dev."StylePreferences" ADD COLUMN "styles" text[];

UPDATE monsoon$dev."StylePreferences"
    SET styles = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."StylePreferences_styles"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."StylePreferences"."id";

DROP TABLE monsoon$dev."StylePreferences_styles";


ALTER TABLE monsoon$dev."StylePreferences" ADD COLUMN "patterns" text[];

UPDATE monsoon$dev."StylePreferences"
    SET patterns = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."StylePreferences_patterns"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."StylePreferences"."id";

DROP TABLE monsoon$dev."StylePreferences_patterns";


ALTER TABLE monsoon$dev."StylePreferences" ADD COLUMN "colors" text[];

UPDATE monsoon$dev."StylePreferences"
    SET colors = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."StylePreferences_colors"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."StylePreferences"."id";

DROP TABLE monsoon$dev."StylePreferences_colors";


ALTER TABLE monsoon$dev."StylePreferences" ADD COLUMN "brands" text[];

UPDATE monsoon$dev."StylePreferences"
    SET brands = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."StylePreferences_brands"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."StylePreferences"."id";

DROP TABLE monsoon$dev."StylePreferences_brands";


ALTER TABLE monsoon$dev."CustomerDetail" ADD COLUMN "weight" integer[];

UPDATE monsoon$dev."CustomerDetail"
    SET weight = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."CustomerDetail_weight"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."CustomerDetail"."id";

DROP TABLE monsoon$dev."CustomerDetail_weight";


ALTER TABLE monsoon$dev."CustomerDetail" ADD COLUMN "topSizes" text[];

UPDATE monsoon$dev."CustomerDetail"
    SET topSizes = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."CustomerDetail_topSizes"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."CustomerDetail"."id";

DROP TABLE monsoon$dev."CustomerDetail_topSizes";


ALTER TABLE monsoon$dev."CustomerDetail" ADD COLUMN "waistSizes" integer[];

UPDATE monsoon$dev."CustomerDetail"
    SET waistSizes = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."CustomerDetail_waistSizes"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."CustomerDetail"."id";

DROP TABLE monsoon$dev."CustomerDetail_waistSizes";


ALTER TABLE monsoon$dev."CustomerDetail" ADD COLUMN "styles" text[];

UPDATE monsoon$dev."CustomerDetail"
    SET styles = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."CustomerDetail_styles"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."CustomerDetail"."id";

DROP TABLE monsoon$dev."CustomerDetail_styles";


ALTER TABLE monsoon$dev."ProductVariantFeedbackQuestion" ADD COLUMN "options" text[];

UPDATE monsoon$dev."ProductVariantFeedbackQuestion"
    SET options = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."ProductVariantFeedbackQuestion_options"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."ProductVariantFeedbackQuestion"."id";

DROP TABLE monsoon$dev."ProductVariantFeedbackQuestion_options";


ALTER TABLE monsoon$dev."ProductVariantFeedbackQuestion" ADD COLUMN "responses" text[];

UPDATE monsoon$dev."ProductVariantFeedbackQuestion"
    SET responses = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."ProductVariantFeedbackQuestion_responses"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."ProductVariantFeedbackQuestion"."id";

DROP TABLE monsoon$dev."ProductVariantFeedbackQuestion_responses";


ALTER TABLE monsoon$dev."ProductRequest" ADD COLUMN "images" text[];

UPDATE monsoon$dev."ProductRequest"
    SET images = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."ProductRequest_images"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."ProductRequest"."id";

DROP TABLE monsoon$dev."ProductRequest_images";


