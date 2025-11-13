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

  // Определяем, какой формат URL используется:
  // params.params = [slug] -> /category/slug (без ticker)
  // params.params = [ticker, slug] -> /category/ticker/slug (с ticker)

  const urlParams = params.params || [];
  let ticker = null;
  let slug = null;

  if (urlParams.length === 1) {
    // Формат: /category/slug
    slug = urlParams[0];
  } else if (urlParams.length === 2) {
    // Формат: /category/ticker/slug
    ticker = urlParams[0];
    slug = urlParams[1];
  } else {
    // Неверный формат URL
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

  // ВАЖНО: Сначала проверяем, нужен ли редирект
  // Если это формат /category/slug (без ticker), проверим есть ли у поста ticker
  if (urlParams.length === 1) {
    // Делаем быстрый запрос чтобы узнать, есть ли ticker у этого поста
    try {
      const checkPostResponse = await axios(
        `${API_BASE}/api/posts`,
        {
          params: {
            fields: ['slug', 'ticker'],
            populate: 'post_category',
            "filters[slug][$eq]": slug,
            "filters[post_category][slug][$eq]": params.category_slug,
          },
        }
      );

      if (checkPostResponse.data?.data?.length) {
        const postData = checkPostResponse.data.data[0];
        const postTicker = postData.attributes?.ticker;

        // Если у поста есть ticker, делаем 301 редирект на /calculator/ticker/slug
        if (postTicker) {
          return {
            redirect: {
              destination: `/calculator/${postTicker}/${slug}`,
              permanent: true, // 301 редирект
            },
          };
        }
      }
    } catch (error) {
      console.error('Error checking post ticker:', error);
    }
  }

  // Если это формат /category/ticker/slug, но category НЕ "calculator"
  // и у поста есть ticker - редиректим на /calculator/ticker/slug
  if (urlParams.length === 2 && params.category_slug !== 'calculator') {
    return {
      redirect: {
        destination: `/calculator/${ticker}/${slug}`,
        permanent: true, // 301 редирект
      },
    };
  }

  // Строим фильтры для запроса
  const postFilters = {
    "filters[slug][$eq]": slug,
  };

  // Если есть ticker, добавляем его в фильтр и НЕ фильтруем по категории
  // потому что посты с ticker могут быть в любой категории
  if (ticker) {
    postFilters["filters[ticker][$eq]"] = ticker;
  } else {
    // Если ticker нет, фильтруем по реальной категории
    postFilters["filters[post_category][slug][$eq]"] = params.category_slug;
  }

  const [postResponse, reviewResponse] = await Promise.all([
    axios(
      `${API_BASE}/api/posts`,
      {
        params: {
          populate: {
            fields: "meta",
            author: {
              avatar: "*",
            },
            media: "*",
            post_category: "*",
            comments: {
              populate:
                "author.avatar,comment.attachments,comment.author.avatar,attachments",
              sort: "analogue_date:desc,commented_at:desc",
            },
          },
          ...postFilters,
        },
      }
    ),
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
          "filters[slug][$eq]": slug,
          "filters[review_category][slug][$eq]": params.category_slug
        },
      }
    ),
  ]);

  if (postResponse.data?.data?.length) {
    const payload = new PostModel(postResponse.data.data[0]);
    post = JSON.parse(JSON.stringify(payload));

    if (post) {
      const requestParams = {
        populate: "media,post_category",
        "filters[slug][$ne]": slug,
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

