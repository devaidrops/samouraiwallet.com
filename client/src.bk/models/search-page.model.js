export class SearchPageModel {
  id;
  meta;
  blog_section_title;
  review_section_title;

  constructor(payload) {
    this.id = payload.id;
    this.blog_section_title = payload.attributes.blog_section_title;
    this.review_section_title = payload.attributes.review_section_title;
    this.meta = {
      title: payload.attributes.meta?.title,
      description: payload.attributes.meta?.description
    };
  }
}
