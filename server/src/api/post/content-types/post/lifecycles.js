module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (isEmpty(data.random_avatar_name_pair)) {
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
          data.random_avatar_name_pair = JSON.stringify(
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
    if (isEmpty(data.threaded_comment) && data.post_category) {
      try {
        const possibleThreads = await strapi.entityService.findMany(
          "api::thread.thread",
          {
            filters: {
              post_categories: {
                $contains: data.post_category,
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
    const { data } = event.params;
    if (data.publishedAt === undefined) {
      if (isEmpty(data.random_avatar_name_pair)) {
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
            data.random_avatar_name_pair = JSON.stringify(
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
      if (isEmpty(data.threaded_comment) && data.post_category) {
        try {
          const possibleThreads = await strapi.entityService.findMany(
            "api::thread.thread",
            {
              filters: {
                post_categories: {
                  $contains: data.post_category,
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
    } else if (data.publishedAt !== null) {
      if (isEmpty(data.date_date)) data.date_date = data.publishedAt;
    }
  },
};

const getRandomValue = (array, count) => {
  if (!array || count <= 0) return null;
  if (count === 1) {
    return array[Math.floor(Math.random() * array.length)];
  }
  if (count > array.length) {
    return array.slice().sort(() => Math.random() - 0.5);
  }
  const shuffledArray = array.slice().sort(() => Math.random() - 0.5);
  return shuffledArray.slice(0, count);
};

const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};
