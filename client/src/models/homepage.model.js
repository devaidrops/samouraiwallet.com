import { DeskCardModel } from "@/models/component/desk-card.model";

export class HomepageModel {
  id;
  meta;
  title;
  subtitle;
  content;
  portfolio_button_link;
  portfolio_button_label;
  popular_posts_text;
  see_all_posts_text;
  see_all_posts_link;
  desk_cards = [];
  publishedAt;
  updatedAt;
  createdAt;

  constructor(payload) {
    this.id = payload.id;
    this.title = payload.attributes.title;
    this.subtitle = payload.attributes.subtitle;
    this.content = payload.attributes.content;
    this.portfolio_button_link = payload.attributes.portfolio_button_link;
    this.portfolio_button_label = payload.attributes.portfolio_button_label;
    this.popular_posts_text = payload.attributes.popular_posts_text;
    this.see_all_posts_text = payload.attributes.see_all_posts_text;
    this.see_all_posts_link = payload.attributes.see_all_posts_link;
    this.desk_cards = (payload.attributes.desk_cards || []).map((item) => new DeskCardModel(item));
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
    this.meta = {
      title: payload.attributes.meta?.title,
      description: payload.attributes.meta?.description
    };
  }
}
