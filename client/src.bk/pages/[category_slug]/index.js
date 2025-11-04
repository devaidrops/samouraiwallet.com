import axios from "axios";
import BlogCategoryPage from "@/components/BlogCategoryPage";
import NotFoundPage from "@/components/NotFoundPage";
import ReviewCategoryPage from "@/components/ReviewCategoryPage";
import { GeneralOptionModel } from "@/models/general-option.model";
import { PostModel } from "@/models/post.model";
import { PostCategoryModel } from "@/models/post-category.model";
import { ReviewCategoryModel } from "@/models/review-category.model";
import { ReviewModel } from "@/models/review.model";

export async function getServerSideProps({ params, query }) {
  const slug = params.category_slug;
  let reviewCategory = null;
  let reviews = [];
  let generalOption = null;
  let page = query.page || null;
  let pageCount = 1;

  let postCategory = null;
  let posts = [];

  const [postCategoryResponse, reviewsResponse] = await Promise.all([
    axios(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/post-categories`,
      {
        params: {
          populate: "meta,slug,title,name",
          "filters[slug][$eq]": slug,
        },
      }
    ),
    axios(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/review-categories`,
      {
        params: {
          populate: "meta,trigger_values,company_info",
          "filters[slug][$eq]": slug,
        },
      }
    ),
  ]);

  if (postCategoryResponse.data?.data?.length) {
    postCategory = JSON.parse(
      JSON.stringify(new PostCategoryModel(postCategoryResponse.data.data[0]))
    );

    const postResponse = await axios(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/posts`,
      {
        params: {
          populate:
            "author.avatar,media,meta,comments.author.avatar,comments.comment,comments.comment.author.avatar,post_category",
          "pagination[pageSize]": 18,
          "pagination[page]": page,
          "filters[post_category][slug][$eq]": slug,
        },
      }
    );
    const payload = postResponse.data.data.map((post) => new PostModel(post));
    posts = JSON.parse(JSON.stringify(payload));
    pageCount = postResponse.data.meta?.pagination?.pageCount || 1;
  }

  if (reviewsResponse.data?.data?.length) {
    const payload = new ReviewCategoryModel(reviewsResponse.data.data[0]);
    reviewCategory = JSON.parse(JSON.stringify(payload));

    if (reviewCategory) {
      const reviewsResponse = await axios(
        `${
          process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
        }/api/reviews`,
        {
          params: {
            populate:
              "logo,review_category,review_categories,trigger_values,company_info,summary",
            // 'filters[review_category][slug][$contains]': reviewCategory.slug + "1",
            "pagination[pageSize]": 15,
            "pagination[page]": page,
            "filters[review_category][slug][$eq]": slug,
            sort: "rating:desc",
          },
        }
      );

      if (reviewsResponse.data?.data?.length) {
        const payload = reviewsResponse.data.data.map(
          (item) => new ReviewModel(item)
        );
        reviews = JSON.parse(JSON.stringify(payload));
      }

      pageCount = reviewsResponse.data.meta?.pagination?.pageCount || 1;
      page = reviewsResponse.data.meta?.pagination?.page || 1;
    }

    const generalOptionResponse = await axios.get(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/general-option`,
      {
        params: {
          populate: `
        review_options.widget_min_deposit_withdrawal,
        review_options.widget_trading_volume,
        review_options.widget_verification,
        review_options.widget_spot_commission,
        review_options.widget_futures_commission,
        review_options.company_info_widgets.icon,
        review_background`,
        },
      }
    );

    if (generalOptionResponse.data?.data) {
      const payload = new GeneralOptionModel(generalOptionResponse.data.data);
      generalOption = JSON.parse(JSON.stringify(payload));
    }
  }

  return {
    props: {
      reviewCategory,
      reviews,

      postCategory,
      posts,

      pageCount,
      page,
      generalOption,
    },
  };
}

export default function ExchangePage({
  reviewCategory,
  reviews,
  postCategory,
  posts,
  pageCount,
  page,
  generalOption,
}) {
  if (!reviewCategory && !postCategory) {
    return <NotFoundPage />;
  }

  if (reviewCategory) {
    return (
      <ReviewCategoryPage
        reviewCategory={reviewCategory}
        reviews={reviews}
        pageCount={pageCount}
        page={page}
        generalOption={generalOption}
      />
    );
  }

  return (
    <BlogCategoryPage
      postCategory={postCategory}
      posts={posts}
      pageCount={pageCount}
      page={page}
      generalOption={generalOption}
    />
  );
}
