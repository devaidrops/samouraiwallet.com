import { baseAPIUrl } from "@/constants/constants";
import { CommentModel } from "@/models/comment.model";
import { PostCategoryModel } from "@/models/post-category.model";

export class PostModel {
  id;
  title;
  description;
  author;
  publishedAt;
  updatedAt;
  createdAt;
  content;
  post_content;
  meta;
  slug;
  media;
  comments;
  post_category;
  allow_thread;
  threaded_comment;
  random_avatar_name_pair;

  constructor(payload) {
    this.id = payload.id;
    this.title = payload.attributes.title;
    this.slug = payload.attributes.slug;
    this.description = payload.attributes.description;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
    this.content = payload.attributes.content;
    this.post_content = payload.attributes.post_content;
    this.allow_thread = payload.attributes.allow_thread;
    this.threaded_comment = payload.attributes.threaded_comment;
    this.random_avatar_name_pair = payload.attributes.random_avatar_name_pair;

    if (payload.attributes.post_category?.data) {
      this.post_category = new PostCategoryModel(
        payload.attributes.post_category.data
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

    const mediaURL = payload.attributes.media?.data?.attributes?.url;
    this.media = mediaURL ? `${baseAPIUrl}${mediaURL}` : "";
    this.comments = payload.attributes.comments?.data?.map(
      (item) => new CommentModel(item)
    );
  }
}
