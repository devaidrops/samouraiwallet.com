const strapi = require('@strapi/strapi');

strapi().load().then(async (app) => {
  try {
    const config = await app.query('api::config-review.config-review').findOne({
      populate: {
        review_categories: true,
        pros: true,
        cons: true,
        possible_trigger_values: {
          populate: {
            widget_min_deposit_withdrawal_values: true,
            widget_trading_volume_values: true,
            widget_verification_values: true,
            widget_spot_commission_values: true,
            widget_futures_commission_values: true,
          }
        },
        possible_company_info: {
          populate: { values: true }
        }
      }
    });
    
    console.log('=== Config Review Status ===');
    console.log('Exists:', !!config);
    console.log('Review categories:', config?.review_categories?.length || 0);
    console.log('Pros:', config?.pros?.length || 0);
    console.log('Cons:', config?.cons?.length || 0);
    console.log('Possible company info:', config?.possible_company_info?.length || 0);
    console.log('Has trigger values:', !!config?.possible_trigger_values);
    
    const ratingCategories = await app.query('api::review-rating-category.review-rating-category').findMany();
    console.log('Rating categories:', ratingCategories?.length || 0);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await app.destroy();
  process.exit(0);
}).catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
