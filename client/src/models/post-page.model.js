export class PostPageModel {
  id;
  interesting_posts_text;
  see_all_posts_text;
  see_all_posts_link;
  publishedAt;
  updatedAt;
  createdAt;

  constructor(payload) {
    this.id = payload.id;
    this.interesting_posts_text = payload.attributes.interesting_posts_text;
    this.see_all_posts_text = payload.attributes.see_all_posts_text;
    this.see_all_posts_link = payload.attributes.see_all_posts_link;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
  }
}
