import { baseAPIUrl } from "@/constants/constants";
import { CommentModel } from "@/models/comment.model";
import { ReviewCategoryModel } from "@/models/review-category.model";

export class ReviewModel {
  id;
  meta;
  slug;
  title;
  rating;
  summaryRating;
  author;
  publishedAt;
  updatedAt;
  createdAt;
  content;
  media;
  logo;
  comments;
  summary;
  company_info;
  external_link;
  trigger_values;
  pros;
  cons;
  review_category;
  review_categories = [];
  allow_thread;
  threaded_comment;
  random_avatar_name_pair;

  constructor(payload) {
    this.id = payload.id;
    this.title = payload.attributes.title;
    this.slug = payload.attributes.slug;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
    this.content = payload.attributes.content;
    this.external_link = payload.attributes.external_link || "#";
    this.pros = payload.attributes.pros;
    this.cons = payload.attributes.cons;
    this.allow_thread = payload.attributes.allow_thread;
    this.threaded_comment = payload.attributes.threaded_comment;
    this.random_avatar_name_pair = payload.attributes.random_avatar_name_pair;
    this.summary = (payload.attributes.summary || []).map((item) => ({
      id: item.id,
      rating: item.rating,
      title: item.title,
    }));
    this.comments = payload.attributes.comments?.data?.map(
      (item) => new CommentModel(item)
    );

    this.rating = payload.attributes.rating;

    this.summaryRating = this.summary
      ? (this.summary || []).reduce((prev, item) => prev + item.rating, 0) /
        (this.summary?.length || 1)
      : payload.attributes.rating;

    if (payload.attributes.review_category?.data) {
      this.review_category = new ReviewCategoryModel(
        payload.attributes.review_category?.data
      );
    }

    if (payload.attributes.review_categories?.data?.length) {
      this.review_categories = payload.attributes.review_categories.data.map(
        (category) => new ReviewCategoryModel(category)
      );
    }

    const avatarURL =
      payload.attributes.author?.data?.attributes?.avatar?.data?.attributes
        ?.url;
    this.author = {
      id: payload.attributes.author?.data?.id,
      name: payload.attributes.author?.data?.attributes?.name,
      description: payload.attributes.author?.data?.attributes?.description,
      avatar: avatarURL ? `${baseAPIUrl}${avatarURL}` : "",
    };

    this.meta = {
      title: payload.attributes.meta?.title,
      description: payload.attributes.meta?.description,
    };

    const logoURL = payload.attributes.logo?.data?.attributes?.url;
    this.logo = logoURL ? `${baseAPIUrl}${logoURL}` : "";
    this.comments = payload.attributes.comments?.data?.map(
      (item) => new CommentModel(item)
    );
    this.trigger_values = payload.attributes.trigger_values;
    this.company_info = payload.attributes.company_info || [];
  }
}
