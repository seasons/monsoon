
export const HomepageResult = {
  __resolveType(obj, _context, _info){
    if(obj.brand || obj.colorway){
      return 'Product';
    }

    // FIXME: Add category
    // if(obj.website){
    //   return 'Category';
    // }

    if(obj.brandCode){
      return 'Brand';
    }

    if(obj.heroImageURL){
      return 'Hero';
    }

    return null;
  },
}