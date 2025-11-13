export class ReviewCategoryModel {
  id;
  meta;
  slug;
  title;
  content;
  publishedAt;
  updatedAt;
  createdAt;

  constructor(payload) {
    this.id = payload.id;
    this.title = payload.attributes.title;
    this.slug = payload.attributes.slug;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
    this.content = payload.attributes.content;

    this.meta = {
      title: payload.attributes.meta?.title,
      description: payload.attributes.meta?.description
    };
  }
}
