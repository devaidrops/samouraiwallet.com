module.exports = {
  async afterFindOne(event) {
    const { result } = event;

    if (!result.commented_at) {
      result.commented_at = result.createdAt;
    }
  },
  async beforeCreate(event) {
    const { data } = event.params;
    data.excerpt =
      data.text.length > 100 ? data.text.substring(0, 100) + "..." : data.text;
  },
  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.publishedAt === undefined) {
      data.excerpt =
        data.text.length > 100
          ? data.text.substring(0, 100) + "..."
          : data.text;
    }
  },
};
