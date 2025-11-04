export class PostCategoryModel {
  id;
  meta;
  slug;
  title;
  name;
  publishedAt;
  updatedAt;
  createdAt;

  constructor(payload) {
    this.id = payload.id;
    this.title = payload.attributes.title;
    this.slug = payload.attributes.slug;
    this.name = payload.attributes.name;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;

    this.meta = {
      title: payload.attributes.meta?.title,
      description: payload.attributes.meta?.description
    };
  }
}
