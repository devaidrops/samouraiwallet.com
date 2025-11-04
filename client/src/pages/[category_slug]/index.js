import axios from "axios";
import Head from "next/head";
import BlogCategoryPage from "@/components/BlogCategoryPage";
import NotFoundPage from "@/components/NotFoundPage";
import ReviewCategoryPage from "@/components/ReviewCategoryPage";
import { GeneralOptionModel } from "@/models/general-option.model";
import { PostModel } from "@/models/post.model";
import { PostCategoryModel } from "@/models/post-category.model";
import { ReviewCategoryModel } from "@/models/review-category.model";
import { ReviewModel } from "@/models/review.model";

// твой API
const API_BASE = "http://127.0.0.1:1337";

// простой конвертер Strapi Rich text (Blocks) -> html
function blocksToHtml(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        const text = (block.children || [])
          .map((c) => c.text || "")
          .join("");
        return `<p>${text}</p>`;
      }
      return "";
    })
    .join("");
}

export async function getServerSideProps({ params, query, req }) {
  const slug = params.category_slug;

  let reviewCategory = null;
  let reviews = [];
  let generalOption = null;
  let page = query.page || null;
  let pageCount = 1;

  let postCategory = null;
  let posts = [];

  // если это не категория и не обзор — сюда положим нашу страницу
  let customPage = null;

  // 1. загрузим ВСЁ, что нужно, параллельно
  const [
    postCategoryResponse,
    reviewsResponse,
    generalOptionResponse,
  ] = await Promise.all([
    axios(`${API_BASE}/api/post-categories`, {
      params: {
        populate: "meta,slug,title,name",
        "filters[slug][$eq]": slug,
      },
    }),
    axios(`${API_BASE}/api/review-categories`, {
      params: {
        populate: "meta,trigger_values,company_info",
        "filters[slug][$eq]": slug,
      },
    }),
    // вот это теперь всегда выполняется
    axios(`${API_BASE}/api/general-option`, {
      params: {
        // можно одной строкой, главное без переносов
        populate:
          "review_options.widget_min_deposit_withdrawal,review_options.widget_trading_volume,review_options.widget_verification,review_options.widget_spot_commission,review_options.widget_futures_commission,review_options.company_info_widgets.icon,review_background",
      },
    }),
  ]);

  // ----- generalOption -----
  if (generalOptionResponse.data?.data) {
    // как у тебя было
    const payload3 = new GeneralOptionModel(generalOptionResponse.data.data);
    generalOption = JSON.parse(JSON.stringify(payload3));
  }

  // ----- постовая категория -----
  if (postCategoryResponse.data?.data?.length) {
    postCategory = JSON.parse(
      JSON.stringify(new PostCategoryModel(postCategoryResponse.data.data[0]))
    );

    const postResponse = await axios(`${API_BASE}/api/posts`, {
      params: {
        populate:
          "author.avatar,media,meta,comments.author.avatar,comments.comment,comments.comment.author.avatar,post_category",
        "pagination[pageSize]": 18,
        "pagination[page]": page,
        "filters[post_category][slug][$eq]": slug,
      },
    });

    const payload = postResponse.data.data.map((post) => new PostModel(post));
    posts = JSON.parse(JSON.stringify(payload));
    pageCount = postResponse.data.meta?.pagination?.pageCount || 1;
  }

  // ----- категория обзоров -----
  if (reviewsResponse.data?.data?.length) {
    const payload = new ReviewCategoryModel(reviewsResponse.data.data[0]);
    reviewCategory = JSON.parse(JSON.stringify(payload));

    if (reviewCategory) {
      const reviewsResponse2 = await axios(`${API_BASE}/api/reviews`, {
        params: {
          populate:
            "logo,review_category,review_categories,trigger_values,company_info,summary",
          "pagination[pageSize]": 15,
          "pagination[page]": page,
          "filters[review_category][slug][$eq]": slug,
          sort: "rating:desc",
        },
      });

      if (reviewsResponse2.data?.data?.length) {
        const payload2 = reviewsResponse2.data.data.map(
          (item) => new ReviewModel(item)
        );
        reviews = JSON.parse(JSON.stringify(payload2));
      }

      pageCount = reviewsResponse2.data.meta?.pagination?.pageCount || 1;
      page = reviewsResponse2.data.meta?.pagination?.page || 1;
    }
  }

  // ----- если это вообще не категория -----
  if (!postCategory && !reviewCategory) {
    try {
      const pageRes = await axios(`${API_BASE}/api/pages`, {
        params: {
          populate: {
            media: "*",
            author: {
              populate: "avatar",
            },
            meta: "*",
          },
          "filters[slug][$eq]": slug,
        },
      });

      if (pageRes.data?.data?.length) {
        const item = pageRes.data.data[0];
        const attrs = item.attributes;

        const metaItem =
          Array.isArray(attrs.meta) && attrs.meta.length
            ? attrs.meta[0]
            : null;

        customPage = {
          title: attrs.title || "",
          content: Array.isArray(attrs.description)
            ? blocksToHtml(attrs.description)
            : attrs.description || "",
          image: attrs.media?.data?.attributes?.url || null,
          metaTitle: metaItem?.title || "",
          metaDescription: metaItem?.description || "",
          author: attrs.author
            ? {
                name: attrs.author.data?.attributes?.name || "",
                avatar:
                  attrs.author.data?.attributes?.avatar?.data?.attributes?.url ||
                  null,
              }
            : null,
        };
      }
    } catch (err) {
      console.error("Failed to load custom page", err.message);
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
      generalOption, // теперь он есть всегда
      customPage,
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
  customPage,
}) {
  // 1. отрисовываем новую страницу, если это она
  if (!reviewCategory && !postCategory && customPage) {
    return (
      <>
        <Head>
          <title>
            {customPage.metaTitle
              ? customPage.metaTitle
              : customPage.title}
          </title>
          {customPage.metaDescription ? (
            <meta name="description" content={customPage.metaDescription} />
          ) : null}
        </Head>

        <main className="container">
          <div id="wysiwyg" class="wysiwyg-content">
            <h1>{customPage.title}</h1>

            {customPage.author ? (
              <p style={{ opacity: 0.7, marginTop: "8px" }}>
                Автор: {customPage.author.name}
              </p>
            ) : null}

            {customPage.image ? (
              <p>
                <img
                  src={customPage.image}
                  alt={customPage.title}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </p>
            ) : null}

            {customPage.content ? (
              <div
                className="page-content"
                dangerouslySetInnerHTML={{ __html: customPage.content }}
              />
            ) : null}
          </div>
        </main>
      </>
    );
  }


  // 2. старое поведение
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
