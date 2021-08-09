ALTER TABLE monsoon$dev."AdminActionLog" ALTER COLUMN "changedFields" TYPE JSON  USING "changedFields"::json;
ALTER TABLE monsoon$dev."AdminActionLog" ALTER COLUMN "rowData" TYPE JSON  USING "rowData"::json;
ALTER TABLE monsoon$dev."AdminActionLogInterpretation" ALTER COLUMN "data" TYPE JSON  USING "data"::json;
ALTER TABLE monsoon$dev."PackageTransitEvent" ALTER COLUMN "data" TYPE JSON  USING "data"::json;
ALTER TABLE monsoon$dev."Brand" ALTER COLUMN "logo" TYPE JSON  USING "logo"::json;
ALTER TABLE monsoon$dev."Category" ALTER COLUMN "image" TYPE JSON  USING "image"::json;
