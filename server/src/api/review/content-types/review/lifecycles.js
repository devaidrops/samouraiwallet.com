const {
  getRandomElement,
  getRandomElements,
} = require("../../../../utils/array.utils");

module.exports = {
  async afterFindOne(event) {
    const { result } = event;

    if (!result) return;

    if (result.summary) {
      const summaryCategories = await strapi
        .query("api::review-rating-category.review-rating-category")
        .findMany();
      result.summary.map((item, index) => {
        item.title = summaryCategories[index]?.label ?? "";
      });
    }

    const generalOptions = await strapi
      .query("api::general-option.general-option")
      .findOne({
        populate: {
          review_options: {
            populate: {
              company_info_widgets: true,
              widget_min_deposit_withdrawal: true,
              widget_trading_volume: true,
              widget_verification: true,
              widget_spot_commission: true,
              widget_futures_commission: true,
            },
          },
        },
      });
    const reviewOptions = generalOptions.review_options;

    if (result.trigger_values) {
      result.trigger_values.widget_min_deposit_withdrawal_label =
        reviewOptions.widget_min_deposit_withdrawal?.label || "";
      result.trigger_values.widget_trading_volume_label =
        reviewOptions.widget_trading_volume?.label || "";
      result.trigger_values.widget_verification_label =
        reviewOptions.widget_verification?.label || "";
      result.trigger_values.widget_spot_commission_label =
        reviewOptions.widget_spot_commission?.label || "";
      result.trigger_values.widget_futures_commission_label =
        reviewOptions.widget_futures_commission?.label || "";
    }

    if (result.company_info) {
      if (reviewOptions.company_info_widgets?.length > 0) {
        const labels = reviewOptions.company_info_widgets.map(
          (widget) => widget.label
        );
        result.company_info.forEach((item, index) => {
          if (!item.title && labels[index]) {
            item.title = labels[index];
          }
        });
      }
    }
  },

  async beforeCreate(event) {
    const configReview = await strapi
      .query("api::config-review.config-review")
      .findOne({
        populate: {
          review_categories: true,
          default_review_category: true,
          cons: true,
          pros: true,
          possible_trigger_values: {
            populate: {
              widget_min_deposit_withdrawal_values: true,
              widget_trading_volume_values: true,
              widget_verification_values: true,
              widget_spot_commission_values: true,
              widget_futures_commission_values: true,
            },
          },
          possible_company_info: {
            populate: {
              values: true,
            },
          },
        },
      });

    // Генерируем общий рейтинг от 1.2 до 2.9
    if (!event.params.data.rating) {
      event.params.data.rating = +(Math.random() * (2.9 - 1.2) + 1.2).toFixed(1);
    }

    if (!event.params.data?.summary?.length) {
      const summaryCategories = await strapi
        .query("api::review-rating-category.review-rating-category")
        .findMany();
      if (summaryCategories?.length > 0) {
        const baseRating = event.params.data.rating;
        const variance = 0.5;

        const result = await strapi.query("review.summary-rating").createMany({
          data: summaryCategories.map((category) => {
            const offset = (Math.random() * 2 - 1) * variance;
            const categoryRating = Math.max(0.5, Math.min(5, baseRating + offset));
            return {
              title: category.label,
              rating: +categoryRating.toFixed(1),
            };
          }),
        });
        event.params.data.summary = result.ids.map((id) => ({
          id,
          __pivot: { field: "summary", component_type: "review.summary-rating" },
        }));
      }
    }

    // ✅ дефолтная рубрика (если не передали)
    if (!event.params.data.review_category) {
      if (configReview?.default_review_category?.id) {
        event.params.data.review_category = configReview.default_review_category.id;
      } else if (configReview.review_categories?.length > 0) {
        // fallback: рандом
        event.params.data.review_category = getRandomElement(
          configReview.review_categories.map((category) => category.id)
        );
      }
    }

    // ✅ many-to-many: если не передали — подключаем все доступные
    if (!event.params.data.review_categories?.connect?.length) {
      if (configReview.review_categories?.length > 0) {
        if (!event.params.data.review_categories) {
          event.params.data.review_categories = {};
        }
        event.params.data.review_categories.connect =
          configReview.review_categories.map((category) => category.id);
      }
    }

    const possibleTriggerValues = configReview.possible_trigger_values;
    if (!event.params.data?.trigger_values) {
      const minDepositWithdrawal =
        possibleTriggerValues.widget_min_deposit_withdrawal_values;
      const tradingVolume = possibleTriggerValues.widget_trading_volume_values;
      const verification = possibleTriggerValues.widget_verification_values;
      const spotCommission =
        possibleTriggerValues.widget_spot_commission_values;
      const futuresCommission =
        possibleTriggerValues.widget_futures_commission_values;

      const result = await strapi.query("review.trigger-value").create({
        data: {
          widget_min_deposit_withdrawal:
            getRandomElement(minDepositWithdrawal)?.value,
          widget_trading_volume: getRandomElement(tradingVolume)?.value,
          widget_verification: getRandomElement(verification)?.value,
          widget_spot_commission: getRandomElement(spotCommission)?.value,
          widget_futures_commission: getRandomElement(futuresCommission)?.value,
          widget_min_deposit_withdrawal_label:
            possibleTriggerValues.widget_min_deposit_withdrawal_label,
          widget_trading_volume_label:
            possibleTriggerValues.widget_trading_volume_label,
          widget_verification_label:
            possibleTriggerValues.widget_verification_label,
          widget_spot_commission_label:
            possibleTriggerValues.widget_spot_commission_label,
          widget_futures_commission_label:
            possibleTriggerValues.widget_futures_commission_label,
        },
      });
      event.params.data.trigger_values = [
        {
          id: result.id,
          __pivot: {
            field: "trigger_values",
            component_type: "review.trigger-value",
          },
        },
      ];
    }

    const possibleCompanyInfo = configReview.possible_company_info;
    if (!event.params.data?.company_info?.length && possibleCompanyInfo?.length > 0) {
      const result = await strapi.query("review.company-info").createMany({
        data: possibleCompanyInfo.map((item) => {
          const values = item.values || [];
          const value = values.at(Math.floor(Math.random() * values.length));
          return { title: item.label, value: value?.value, link: value?.link };
        }),
      });
      event.params.data.company_info = result.ids.map((id) => ({
        id,
        __pivot: {
          field: "company_info",
          component_type: "review.company-info",
        },
      }));
    }

    const cons = configReview.cons;
    const pros = configReview.pros;

    if (!event.params.data?.pros?.length && pros.length) {
      const result = await strapi.query("review.pros-cons").create({
        data: { text: getRandomElement(pros).text },
      });
      event.params.data.pros = [
        {
          id: result.id,
          __pivot: { field: "pros", component_type: "review.pros-cons" },
        },
      ];
    }

    if (!event.params.data?.cons?.length && cons.length) {
      const result = await strapi.query("review.pros-cons").createMany({
        data: getRandomElements(cons, 3).map((item) => ({ text: item.text })),
      });
      event.params.data.cons = result.ids.map((id) => ({
        id,
        __pivot: { field: "cons", component_type: "review.pros-cons" },
      }));
    }

    if (isEmpty(event.params.data.random_avatar_name_pair)) {
      try {
        const configThread = await strapi
          .query("api::config-thread.config-thread")
          .findOne({
            populate: {
              random_avatars: {
                populate: {
                  value: {
                    fields: ["url"],
                  },
                },
              },
              random_names: true,
            },
          });
        const count = Math.min(
          configThread.random_names.length,
          configThread.random_avatars.length
        );
        if (count > 0) {
          const randomNames = getRandomValue(
            configThread.random_names.map((i) => i.value),
            count
          );
          const randomAvatars = getRandomValue(
            configThread.random_avatars.map((i) => i.value.url),
            count
          );
          event.params.data.random_avatar_name_pair = JSON.stringify(
            randomNames.map((name, index) => ({
              name,
              avatar: randomAvatars[index],
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }

    const { data } = event.params;
    if (isEmpty(data.threaded_comment) && data.review_category) {
      try {
        const possibleThreads = await strapi.entityService.findMany(
          "api::thread.thread",
          {
            filters: {
              review_categories: {
                $contains: data.review_category,
              },
            },
          }
        );
        const possibleThreadsComments = possibleThreads
          .map((item) => item.comments)
          .join(":::::")
          .split(":::::");
        data.threaded_comment = getRandomValue(possibleThreadsComments, 1);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }
  },

  async beforeUpdate(event) {
    if (event.params.data.publishedAt) {
      const review = await strapi
        .query("api::review.review")
        .findOne({ where: event.params.where });
      event.params.data.slug = review.slug?.toLowerCase();
    } else if (event.params.data.publishedAt === undefined) {
      if (isEmpty(event.params.data.random_avatar_name_pair)) {
        try {
          const configThread = await strapi
            .query("api::config-thread.config-thread")
            .findOne({
              populate: {
                random_avatars: {
                  populate: {
                    value: {
                      fields: ["url"],
                    },
                  },
                },
                random_names: true,
              },
            });
          const count = Math.min(
            configThread.random_names.length,
            configThread.random_avatars.length
          );
          if (count > 0) {
            const randomNames = getRandomValue(
              configThread.random_names.map((i) => i.value),
              count
            );
            const randomAvatars = getRandomValue(
              configThread.random_avatars.map((i) => i.value.url),
              count
            );
            event.params.data.random_avatar_name_pair = JSON.stringify(
              randomNames.map((name, index) => ({
                name,
                avatar: randomAvatars[index],
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching config:", error);
        }
      }
      const { data } = event.params;
      if (isEmpty(data.threaded_comment) && data.review_category) {
        try {
          const possibleThreads = await strapi.entityService.findMany(
            "api::thread.thread",
            {
              filters: {
                review_categories: {
                  $contains: data.review_category,
                },
              },
            }
          );
          const possibleThreadsComments = possibleThreads
            .map((item) => item.comments)
            .join(":::::")
            .split(":::::");
          data.threaded_comment = getRandomValue(possibleThreadsComments, 1);
        } catch (error) {
          console.error("Error fetching config:", error);
        }
      }
    }
  },
};

const getRandomValue = (array, count) => {
  if (!array || count <= 0) return null;
  if (count === 1) {
    return array[Math.floor(Math.random() * array.length)];
  }
  if (count > array.length) {
    return array.slice();
  }
  const shuffledArray = array.slice().sort(() => Math.random() - 0.5);
  return shuffledArray.slice(0, count);
};

const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};
