import { baseAPIUrl } from "@/constants/constants";
import { PostModel } from "@/models/post.model";

export class CommentModel {
  id;
  name;
  text;
  posts;
  avatar;
  comments;
  upvote;
  downvote;
  author;
  publishedAt;
  updatedAt;
  createdAt;
  commented_at;
  analogue_date;
  featured;
  attachments = [];

  constructor(payload) {
    this.id = payload.id;
    this.name = payload.attributes.name;
    this.featured = payload.attributes.featured;
    this.text = payload.attributes.text;
    this.upvote = payload.attributes.upvote;
    this.downvote = payload.attributes.downvote;
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
    this.commented_at = payload.attributes.commented_at;
    this.analogue_date = payload.attributes.analogue_date;

    if (payload.attributes.attachments?.data?.length) {
      this.attachments = payload.attributes.attachments.data.map(
        (attachment) => `${baseAPIUrl}${attachment.attributes.url}`
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

    this.avatar = avatarURL ? `${baseAPIUrl}${avatarURL}` : "";
    this.posts = payload.attributes.posts?.data?.map(
      (item) => new PostModel(item)
    );
    if (payload.attributes.comments?.data?.length) {
      this.comments = payload.attributes.comments.data.map(
        (item) => new CommentModel(item)
      );
    }
  }
}
