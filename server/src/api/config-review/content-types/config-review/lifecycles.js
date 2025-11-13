module.exports = {
  async afterFindOne(event) {
    const { result } = event;

    if (result) {
      const generalOptions = await strapi.query("api::general-option.general-option")
        .findOne({
          populate: {
            review_options: {
              populate: {
                company_info_widgets: true,
                widget_min_deposit_withdrawal: true,
                widget_trading_volume: true,
                widget_verification: true,
                widget_spot_commission: true,
                widget_futures_commission: true
              }
            }
          }
        });
      const reviewOptions = generalOptions.review_options;

      if (result.possible_trigger_values) {

        result.possible_trigger_values.widget_min_deposit_withdrawal_label = reviewOptions.widget_min_deposit_withdrawal?.label || "";
        result.possible_trigger_values.widget_trading_volume_label = reviewOptions.widget_trading_volume?.label || "";
        result.possible_trigger_values.widget_verification_label = reviewOptions.widget_verification?.label || "";
        result.possible_trigger_values.widget_spot_commission_label = reviewOptions.widget_spot_commission?.label || "";
        result.possible_trigger_values.widget_futures_commission_label = reviewOptions.widget_futures_commission?.label || "";
      }

      if (result.possible_company_info) {
        const labels = reviewOptions.company_info_widgets.map((widget) => widget.label);
        const info = result.possible_company_info || [];
        result.possible_company_info = [];
        labels.forEach((label, index) => {
          result.possible_company_info.push({ ...info[index], label, values: info[index]?.values || [] });
        })
      }
    }
  },
};