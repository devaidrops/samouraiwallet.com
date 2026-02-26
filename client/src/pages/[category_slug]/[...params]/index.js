import axios from "axios";
import { GeneralOptionModel } from "@/models/general-option.model";
import { ReviewModel } from "@/models/review.model";
import NotFoundPage from "@/components/NotFoundPage";
import { PostModel } from "@/models/post.model";
import ReviewPage from "@/components/ReviewPage";
import BlogPostPage from "@/components/BlogPostPage";
import { PostPageModel } from "@/models/post-page.model";

export async function getServerSideProps({ params, req }) {
  let review = null;
  let generalOption = null;
  let post = null;
  let interestingPosts = [];
  let postPage = null;

  const API_BASE = "http://127.0.0.1:1337";

  // URL может быть двух форматов:
  // 1) /category/slug — для постов с простым slug (bitcoin-sv)
  // 2) /path/with/slashes — для постов со slug, содержащим "/" (coins/bitcoin-sv)
  const urlParams = params.params || [];
  const fullPathSlug = [params.category_slug, ...urlParams].join('/');
  const shortSlug = urlParams.length ? urlParams.join('/') : null;

  if (!shortSlug && !fullPathSlug) {
    return {
      props: {
        review: null,
        post: null,
        postPage: null,
        interestingPosts: [],
        generalOption: null,
        host: req.headers.host,
      },
    };
  }

  // Сначала ищем пост со slug = fullPath (посты с "/" в slug используют полный путь)
  // Затем пост/ревью с shortSlug + category (обычный формат)
  const [postByFullSlugResponse, postByCategorySlugResponse, reviewResponse] = await Promise.all([
    axios(`${API_BASE}/api/posts`, {
      params: {
        populate: {
          meta: "*",
          author: { avatar: "*" },
          media: "*",
          post_category: "*",
          comments: {
            populate: "author.avatar,comment.attachments,comment.author.avatar,attachments",
            sort: "analogue_date:desc,commented_at:desc",
          },
        },
        "filters[slug][$eq]": fullPathSlug,
      },
    }),
    axios(`${API_BASE}/api/posts`, {
      params: {
        populate: {
          meta: "*",
          author: { avatar: "*" },
          media: "*",
          post_category: "*",
          comments: {
            populate: "author.avatar,comment.attachments,comment.author.avatar,attachments",
            sort: "analogue_date:desc,commented_at:desc",
          },
        },
        "filters[slug][$eq]": shortSlug,
        "filters[post_category][slug][$eq]": params.category_slug,
      },
    }),
    axios(
      `${API_BASE}/api/reviews`,
      {
        params: {
          populate: {
            author: "avatar",
            logo: "*",
            meta: "*",
            pros: "*",
            cons: "*",
            summary: "*",
            company_info: "*",
            trigger_values: "*",
            content_menu: "*",
            review_category: "*",
            review_categories: "*",
            comments: {
              populate:
                "author.avatar,comments.attachments,comments.author.avatar,attachments",
              sort: "analogue_date:desc,commented_at:desc",
            },
          },
          "filters[slug][$eq]": shortSlug,
          "filters[review_category][slug][$eq]": params.category_slug
        },
      }
    ),
  ]);

  const postResponse = postByFullSlugResponse.data?.data?.length
    ? postByFullSlugResponse
    : postByCategorySlugResponse;

  if (postResponse.data?.data?.length) {
    const payload = new PostModel(postResponse.data.data[0]);
    post = JSON.parse(JSON.stringify(payload));

    if (post) {
      const requestParams = {
        populate: "media,post_category",
        "filters[slug][$ne]": post.slug,
        "pagination[pageSize]": 3,
      };
      const [postPageResponse, gteResponse, lteResponse] = await Promise.all([
        axios(
          `${API_BASE}/api/post-page`
        ),
        axios(
          `${API_BASE}/api/posts`,
          {
            params: {
              ...requestParams,
              sort: "createdAt:asc",
              "filters[createdAt][$gte]": post.createdAt,
            },
          }
        ),
        axios(
          `${API_BASE}/api/posts`,
          {
            params: {
              ...requestParams,
              sort: "createdAt:desc",
              "filters[createdAt][$lt]": post.createdAt,
            },
          }
        ),
      ]);

      postPage = postPageResponse.data.data
        ? JSON.parse(
            JSON.stringify(new PostPageModel(postPageResponse.data.data))
          )
        : null;

      const relatedPosts = [];
      if (gteResponse.data?.data?.length) {
        relatedPosts.push(
          ...gteResponse.data.data.map((post) => new PostModel(post))
        );
      }

      if (lteResponse.data?.data?.length) {
        relatedPosts.push(
          ...lteResponse.data.data.map((post) => new PostModel(post))
        );
      }

      relatedPosts.sort(
        (a, b) =>
          Math.abs(new Date(b.createdAt) - new Date(post.createdAt)) -
          Math.abs(new Date(a.createdAt) - new Date(post.createdAt))
      );
      interestingPosts = JSON.parse(JSON.stringify(relatedPosts.slice(0, 3)));
    }
  } else if (reviewResponse.data?.data?.length) {
    const payload = new ReviewModel(reviewResponse.data.data[0]);
    review = JSON.parse(JSON.stringify(payload));
  }

  const generalOptionResponse = await axios.get(`${API_BASE}/api/general-option`, {
    params: {
      populate: `
        review_background,
        author.avatar,
        bottom_icons.icon,
        review_options.widget_min_deposit_withdrawal.icon,
        review_options.widget_trading_volume.icon,
        review_options.widget_verification.icon,
        review_options.widget_spot_commission.icon,
        review_options.widget_futures_commission.icon,
        review_options.company_info_widgets.icon,
        site_logo
      `,
    },
  });

  if (generalOptionResponse.data?.data) {
    const payload = new GeneralOptionModel(generalOptionResponse.data.data);
    generalOption = JSON.parse(JSON.stringify(payload));
  }

  return {
    props: {
      review,
      post,
      postPage,
      interestingPosts,
      generalOption,
      host: req.headers.host,
    },
  };
}

export default function DynamicPostPage({
  review,
  post,
  postPage,
  interestingPosts,
  generalOption,
  host,
}) {
  const coinGeckoId =
    post?.coinGeckoId ??
    post?.attributes?.coinGeckoId ??
    post?.data?.attributes?.coinGeckoId ??
    null;

  if (!review && !post) {
    return <NotFoundPage />;
  }

  if (review)
    return (
      <ReviewPage review={review} generalOption={generalOption} host={host} />
    );

  return (
    <BlogPostPage
      post={post}
      interestingPosts={interestingPosts}
      generalOption={generalOption}
      postPage={postPage}
      coinGeckoId={coinGeckoId}
    />
  );
}

