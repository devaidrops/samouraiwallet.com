import { baseAPIUrl } from '@/constants/constants';
import { CommentModel } from "@/models/comment.model";
import { PostModel } from "@/models/post.model";

export class AuthorModel {
  id;
  name;
  description;
  posts;
  avatar;
  comments;

  constructor(payload) {
    this.id = payload.id;
    this.name = payload.attributes.name;
    this.description = payload.attributes.description;

    const avatarURL = payload.attributes.avatar?.data?.attributes?.url;
    this.avatar = avatarURL ? `${baseAPIUrl}${avatarURL}` : ''
    this.posts = payload.attributes.posts?.data?.map((item) => new PostModel(item));
    this.comments = payload.attributes.comments?.data?.map((item) => new CommentModel(item));
  }
}
