import { PostModel } from "@/models/post.model";
import { ReviewModel } from "@/models/review.model";
import { baseAPIUrl } from "@/constants/constants";

export class SidebarModel {
  id;
  current_posts = [];
  current_posts_title = "";
  current_posts_heading_img = "";
  current_reviews = [];
  current_reviews_title = "";
  current_reviews_heading_img = "";
  quiz = null;
  publishedAt;
  updatedAt;
  createdAt;

  constructor(payload) {
    this.id = payload.id;
    this.current_posts_title = payload.attributes.current_posts?.title;
    this.current_posts = (payload.attributes.current_posts?.posts?.data || []).map((post) => new PostModel(post));

    const headingImg = payload.attributes.current_posts?.heading_img?.data?.attributes?.url;
    this.current_posts_heading_img = headingImg ? `${baseAPIUrl}${headingImg}` : '';

    this.current_reviews_title = payload.attributes.current_reviews?.title;
    this.current_reviews = (payload.attributes.current_reviews?.reviews?.data || []).map((review) => new ReviewModel(review));

    const headingImg1 = payload.attributes.current_reviews?.heading_img?.data?.attributes?.url;
    this.current_reviews_heading_img = headingImg1 ? `${baseAPIUrl}${headingImg1}` : '';

    if (payload.attributes.quiz) {
      const quiz = payload.attributes.quiz;
      this.quiz = {
        id: quiz.id,
        question: quiz.question,
        quiz_options: quiz.quiz_options.map((option) => ({
          id: option.id,
          option_text: option.option_text,
          upvotes: option.upvotes,
        }))
      };
    }
    this.publishedAt = payload.attributes.publishedAt;
    this.updatedAt = payload.attributes.updatedAt;
    this.createdAt = payload.attributes.createdAt;
  }
}
