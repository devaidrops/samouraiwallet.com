import { useMemo } from "react";
import NotFoundPage from "@/components/NotFoundPage";
import Head from "next/head";
import { baseClientUrl, robotsTxt } from "@/constants/constants";
import Breadcrumbs from "@/components/Breadcrumbs";
import TableTooltip from "@/components/TableTooltip";
import Link from "next/link";
import Paginator from "@/components/Paginator";
import WysiwigPanel from "@/components/WysiwigPanel";
import Ratings from "@/components/Ratings";

export default function ReviewCategoryPage({
  reviewCategory,
  reviews,
  pageCount,
  page,
  generalOption,
}) {
  const currentPage = +(page || 1);

  const companyInfoWidgets = useMemo(
    () => [...(generalOption?.company_info_widgets || [])],
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

  if (!reviewCategory || page > pageCount) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${reviewCategory.meta.title}${
          page > 1 ? ` (${page})` : ""
        }`}</title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta
          name="description"
          content={`${reviewCategory.meta.description}${
            page > 1 ? ` (${page})` : ""
          }`}
        />
        <link
          rel="canonical"
          href={`${baseClientUrl}/${reviewCategory.slug}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="content-inside">
        <div className="content-top">
          <Breadcrumbs
            items={[
              { url: "/", title: "Home" },
              { url: `/${reviewCategory.slug}`, title: reviewCategory.title },
            ]}
          />
          <h1 itemProp="name">{reviewCategory.title}</h1>
        </div>

        <div className="brokers-table max-sm:table">
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
                {companyInfoWidgets
                  .filter((item) => item.label === "Passed verification?")
                  .map((item) => (
                    <td key={item.id}>
                      <div className="inner text-center">
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
                          alt={review.title}
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
                  {companyInfoWidgets
                    .filter((widget) => widget.label === "Passed verification?")
                    .map((widget) => {
                      const companyInfoItem = review.company_info?.find(
                        (item) => item.title === widget.label
                      );

                      return (
                        <td key={widget.id} className="no-wrap coins-wrapper-mobile">
                          <span className="show-mobile">{widget.label}:&nbsp;</span>
                          <span className="whitespace-normal">
                            {companyInfoItem?.value || "Under review"}
                          </span>
                        </td>
                      );
                  })}

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
            baseURL={`/${reviewCategory.slug}`}
            className="mt-0 mb-4"
          />
        )}
        <div className="bonuses-index__content common-seo-text">
          {currentPage === 1 && (
            <WysiwigPanel content={reviewCategory.content} />
          )}
        </div>
      </div>
    </>
  );
}
