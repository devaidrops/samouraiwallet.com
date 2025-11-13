export class ReviewRatingCategoryModel {
  id;
  label;
  publishedAt;
  updatedAt;
  createdAt;

  constructor(payload) {
    this.id = payload.id;
    this.label = payload.attributes.title;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
  }
}
