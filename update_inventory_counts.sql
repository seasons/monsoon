// reset inventory totals and remove all reservations
//      make sure you include begin transaction so you can inspect the query after
//      then run COMMIT;
//      
//      if you're running in staging or production, set search_path suffix to that word
//          i.e.  @monsoon$staging or monsoon$production

begin transaction;
set search_path TO monsoon$production;
delete from "Reservation";
update "ProductVariant" set "reserved" = 0, "nonReservable" = 0, "reservable" = (select count(*) from "_PhysicalProductToProductVariant" where "B" = "ProductVariant"."id");
update "PhysicalProduct" set "inventoryStatus" = 'Reservable';


// list all the product variants whose reservation counts don't sum up to the total available products
//     then list the total items in that list
select "productID", "total", "reservable", "nonReservable", "reserved", "reserved" + "reservable" + "nonReservable" from "ProductVariant" where "total" != "reserved" + "reservable" + "nonReservable";
select count(*)  from "ProductVariant" where "total" != "reserved" + "reservable" + "nonReservable";
