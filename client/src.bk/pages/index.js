import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { baseClientUrl, robotsTxt } from "@/constants/constants";
import Paginator from "@/components/Paginator";
import TableTooltip from "@/components/TableTooltip";
import { HomepageModel } from "@/models/homepage.model";
import { GeneralOptionModel } from "@/models/general-option.model";
import { PostModel } from "@/models/post.model";
import { ReviewModel } from "@/models/review.model";
import NotFoundPage from "@/components/NotFoundPage";
import Ratings from "@/components/Ratings";

export async function getServerSideProps({ query }) {
  let homepage = null;
  let generalOption = null;

  let reviews = [];
  let page = query.page || null;
  let pageCount = 1;

  let posts = [];
  let postPage = query["post-page"] || 1;
  let postPageCount = 1;

  const generalOptionResponse = await axios.get(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
    }/api/general-option`,
    {
      params: {
        populate: `
      review_options.company_info_widgets.icon,
      review_options.widget_min_deposit_withdrawal,
      review_options.widget_trading_volume,
      review_options.widget_verification,
      review_options.widget_spot_commission,
      review_options.widget_futures_commission,
      review_background`,
      },
    }
  );

  if (generalOptionResponse.data?.data) {
    const payload = new GeneralOptionModel(generalOptionResponse.data.data);
    generalOption = JSON.parse(JSON.stringify(payload));
  }

  const homepageResponse = await axios(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
    }/api/homepage`,
    {
      params: {
        populate: "meta,desk_cards.icon",
        "pagination[pageSize]": 15,
        "pagination[page]": page,
      },
    }
  );

  if (homepageResponse.data?.data) {
    const payload = new HomepageModel(homepageResponse.data.data);
    homepage = JSON.parse(JSON.stringify(payload));
  }

  const reviewsResponse = await axios(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
    }/api/reviews`,
    {
      params: {
        sort: ["rating:desc", "updatedAt:desc", "id:desc"],
        populate:
          "logo,review_category,review_categories,trigger_values,company_info,summary",
        "pagination[pageSize]": 15,
        "pagination[page]": page,
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

  const postsResponse = await axios(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
    }/api/posts`,
    {
      params: {
        populate:
          "author.avatar,media,meta,comments.author.avatar,comments.comment,comments.comment.author.avatar,post_category",
        "pagination[pageSize]": 12,
        "pagination[page]": postPage,
      },
    }
  );

  if (postsResponse.data?.data?.length) {
    const payload = postsResponse.data.data.map((post) => new PostModel(post));
    posts = JSON.parse(JSON.stringify(payload));
  }

  postPageCount = postsResponse.data.meta?.pagination?.pageCount || 1;
  postPage = postsResponse.data.meta?.pagination?.page || 1;

  return {
    props: {
      homepage,
      reviews,
      page,
      pageCount,
      generalOption,
      posts,
      postPageCount,
      postPage,
    },
  };
}

export default function Home({
  homepage,
  reviews,
  page,
  pageCount,
  posts,
  postPageCount,
  postPage,
  generalOption,
}) {
  const currentPage = +(page || 1);
  const currentPostPage = +(postPage || 1);

  const companyInfoWidgets = useMemo(
    () => [...(generalOption?.company_info_widgets || []).slice(0, 3)],
    [generalOption]
  );

  const ratingImages = useMemo(
    () => ({
      starEmpty: "/img/star-empty.svg",
      starFull: "/img/star-full.svg",
      starHalf: "/img/star-half.svg",
    }),
    []
  );

  if (page > pageCount || postPage > postPageCount) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${homepage.meta.title}${page > 1 ? ` (${page})` : ""}`}</title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta
          name="description"
          content={`${homepage.meta.description}${
            page > 1 ? ` (${page})` : ""
          }`}
        />
        <link rel="canonical" href={baseClientUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="content-inside articles-show">
        <div className="content-top">
          <div itemScope="" itemType="https://schema.org/BreadcrumbList">
            <div
              itemProp="itemListElement"
              itemScope=""
              itemType="https://schema.org/ListItem"
            >
              <link href={baseClientUrl} itemProp="item" />
              <meta itemProp="name" content="Home" />
              <meta itemProp="position" content="1" />
            </div>
          </div>
          <h1 itemProp="name">{homepage.title}</h1>
          <div className="page-desc laptop-desktoptext-m-15-reg">
            <p>{homepage.subtitle}</p>
          </div>
        </div>
        {/* <div className="home-top-cards-wrapper">
          <div className="home-top-cards">
            {homepage.desk_cards.map((item) => (
              <Link key={item.id} href={item.link} className="desk-card">
                <div
                  className="text_label laptop-desktoptext-m-15-sb"
                  dangerouslySetInnerHTML={{ __html: item.label }}
                ></div>
                <img className="image-card" src={item.icon} alt={item.label} />
              </Link>
            ))}
          </div>
        </div> */}

        <div className="brokers-table sm:overflow-auto max-sm:table">
          <table>
            <thead>
              <tr>
                <td>
                  <div className="inner">{/* <span>Exchange</span> */}</div>
                </td>
                <td>
                  <div className="inner text-center">
                    <span>Overall rating</span>
                  </div>
                </td>
                {companyInfoWidgets.map((item) => (
                  <td key={item.id}>
                    <div className="inner">
                      <span className="whitespace-nowrap">{item.label}</span>

                      {item.tooltip_title && item.tooltip_content && (
                        <TableTooltip
                          title={item.tooltip_title}
                          content={item.tooltip_content}
                        />
                      )}
                    </div>
                  </td>
                ))}
                <td className="link"></td>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="logo-wrapper-cell">
                    <span className="logo-wrapper">
                      <Link
                        href={`/${review.review_category.slug}/${review.slug}`}
                      >
                        <img
                          className="broker-logo"
                          src={review.logo}
                          alt={review.id}
                          width="24"
                          height="24"
                        />
                      </Link>
                      <Link
                        href={`/${review.review_category.slug}/${review.slug}`}
                      >
                        <span className="name">{review.title}</span>
                      </Link>
                    </span>
                  </td>
                  <td className="no-wrap turnover-wrapper">
                    <span className="normal-rating flex justify-center items-center gap-1 flex-nowrap">
                      <span className="sm:mb-[1px]">{review.rating}</span>
                      <Ratings
                        rating={review.rating}
                        starImages={ratingImages}
                        mobile
                      />
                    </span>
                  </td>
                  <td className="no-wrap coins-wrapper">
                    <span className="show-mobile">
                      {companyInfoWidgets[0].label}:&nbsp;
                    </span>
                    <span className="whitespace-normal">
                      {review.company_info[0]?.value}
                    </span>
                  </td>
                  <td className="kyc-wrapper">
                    <span className="show-mobile">
                      {companyInfoWidgets[1].label}:&nbsp;
                    </span>
                    <span className="whitespace-normal value">
                      {review.company_info[1]?.value}
                    </span>
                  </td>
                  <td className="no-wrap fiat-wrapper">
                    <span className="whitespace-normal">
                      {review.company_info[2]?.value}
                    </span>
                  </td>
                  <td className="link-wrapper">
                    <Link
                      href={`/${review.review_category.slug}/${review.slug}`}
                      className="desk-button-table desk-button"
                      title={review.title}
                    >
                      <div className="button-text laptop-desktoptext-s-14-med">
                        Review
                      </div>
                      <img
                        src="/img/icon-arrow-table.svg"
                        className="show-mobile"
                        alt=""
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <Paginator
            currentPage={currentPage}
            pageCount={pageCount}
            baseURL="/"
            className="mt-0 mb-4"
          />
        )}

        {posts.length > 0 && (
          <div className="block-wrapper mb-0">
            <div className="block-title">
              <div className="block-title-inside">
                <div className="laptop-desktoph2-sb-30">
                  {homepage.popular_posts_text}
                </div>
                <div className="text-button">
                  <Link
                    href={homepage.see_all_posts_link}
                    className="text-3 laptop-desktoptext-s-14-reg"
                  >
                    {homepage.see_all_posts_text}
                  </Link>
                </div>
              </div>
            </div>
            <div className="articles-index">
              <div className="articles-list">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${post.post_category.slug}/${post.slug}`}
                    className="article-block"
                  >
                    <div
                      className="article-block-inner"
                      style={{ backgroundImage: `url(${post.media})` }}
                    >
                      <div className="article-block-title">{post.title}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {pageCount > 1 && (
                <Paginator
                  currentPage={currentPostPage}
                  pageCount={postPageCount}
                  baseURL="/"
                  queryKey="post-page"
                  className="mb-4"
                />
              )}
            </div>
          </div>
        )}

        <div className="invest">
          <div className="portofolio-item mb-0">
            <div className="tab-content-wrapper">
              <div
                className="portfolio-list-item-tab tab-content portfolio-list-item-tab_dynamic tab-pane active"
                id="portfolio-list-item__dynamic_2"
              >
                <div className="portfolio-list-item__feed-short">
                  {/* <div className="portfolio-list-item__title">
                    Event feed:
                  </div> */}

                  <div
                    className="wysiwyg-content"
                    dangerouslySetInnerHTML={{ __html: homepage.content }}
                  ></div>
                </div>
                <Link
                  href={homepage.portfolio_button_link}
                  className="wide-btn"
                >
                  <span>{homepage.portfolio_button_label}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
