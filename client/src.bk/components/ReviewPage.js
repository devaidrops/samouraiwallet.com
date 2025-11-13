import axios from "axios";
import clsx from "clsx";
// import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { generateSummaryChartOption } from "@/utils/summary-chart.util";
import NotFoundPage from "@/components/NotFoundPage";
import { baseClientUrl, robotsTxt } from "@/constants/constants";
import Breadcrumbs from "@/components/Breadcrumbs";
import Ratings from "@/components/Ratings";
import CommentBlock from "@/components/CommentBlock";
import WysiwigPanel from "@/components/WysiwigPanel";
import { CommentModel } from "@/models/comment.model";
import moment from "moment";
import "moment/locale/ru";
import RingChart from "./RingChart";
moment.locale("ru");

// const ReactApexChart = dynamic(() => import("react-apexcharts"), {
//   ssr: false,
// });

export default function ReviewPage({ review, generalOption, host }) {
  const [currentStars, setCurrentStars] = useState(generalOption.stars || 0);
  const [currentUpVote, setCurrentUpVote] = useState(generalOption.upvote || 0);
  const [currentDownVote, setCurrentDownVote] = useState(
    generalOption.downvote || 0
  );
  const [contentMenu, setContentMenu] = useState([]);
  const timeout = useRef(null);
  const formData = useRef({ name: "", text: "" });
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentFormShow, setCommentFormShow] = useState(false);
  const [showArticleMenu, setShowArticleMenu] = useState(false);
  const [voted, setVoted] = useState();
  const [chartOptions, setChartOptions] = useState();
  const [loadMore, setLoadMore] = useState(false);
  const [threadedComment, setThreadedComment] = useState(false);
  const [rndPairs, setRndPairs] = useState([]);
  useEffect(() => {
    if (review.allow_thread && review.threaded_comment) {
      const fetchComment = async () => {
        const res = await axios(
          `${
            process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
          }/api/comments`,
          {
            params: {
              populate: {
                attachments: true,
                comments: {
                  populate: {
                    attachments: true,
                  },
                },
              },
              filters: {
                id: {
                  $eq: review.threaded_comment,
                },
              },
            },
          }
        );
        setThreadedComment(new CommentModel(res.data.data[0]));
      };
      fetchComment();
      setRndPairs(JSON.parse(review.random_avatar_name_pair));
    }
  }, [review]);
  const triggerValues = useMemo(
    () => [
      {
        ...generalOption.review_options?.widget_min_deposit_withdrawal,
        value: review?.trigger_values?.widget_min_deposit_withdrawal,
      },
      {
        ...generalOption.review_options?.widget_trading_volume,
        value: review?.trigger_values?.widget_trading_volume,
      },
      {
        ...generalOption.review_options?.widget_verification,
        value: review?.trigger_values?.widget_verification,
      },
      {
        ...generalOption.review_options?.widget_spot_commission,
        value: review?.trigger_values?.widget_spot_commission,
      },
      {
        ...generalOption.review_options?.widget_futures_commission,
        value: review?.trigger_values?.widget_futures_commission,
      },
    ],
    [review, generalOption]
  );

  const rating = useMemo(
    () =>
      (review?.summary || []).reduce((prev, item) => prev + item.rating, 0) /
      (review?.summary?.length || 1),
    [review]
  );

  const linkConfig = useMemo(() => {
    const isInternalLink =
      review.external_link.split("/")[2] === host ||
      !(
        review.external_link.startsWith("https://") ||
        review.external_link.startsWith("http://")
      );
    return isInternalLink ? {} : { target: "_blank", rel: "nofollow" };
  }, [review, host]);

  useEffect(() => {
    setChartOptions(generateSummaryChartOption(rating));
  }, [rating]);

  useEffect(() => {
    const votes = +(localStorage.getItem("iv_voted") || -2);
    setVoted(votes);
    if (votes === 0) {
      setCurrentStars(generalOption.stars - 1);
    } else if (votes === 1) {
      setCurrentUpVote(generalOption.upvote - 1);
    } else if (votes === -1) {
      setCurrentDownVote(generalOption.downvote - 1);
    }
  }, [generalOption]);

  const updateStates = (state) => {
    axios
      .put(
        `${
          process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
        }/api/general-option`,
        {
          data: {
            stars: currentStars + (state === 0 ? 1 : 0),
            downvote: currentDownVote + (state === -1 ? 1 : 0),
            upvote: currentUpVote + (state === 1 ? 1 : 0),
          },
        }
      )
      .then(() => {
        setVoted(state);
        localStorage.setItem("iv_voted", `${state}`);
      });
  };

  const handleStars = () => {
    if (voted === 0) return;
    updateStates(0);
  };

  const handleUpVote = () => {
    if (voted === 1) return;
    updateStates(1);
  };

  const handleDownVote = () => {
    if (voted === -1) return;
    updateStates(-1);
  };

  const handleCommentUpVote = (id, data) => {
    return axios.put(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/comments/${id}`,
      data
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formValues = formData.current;

    axios
      .post(
        `${
          process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
        }/api/comments`,
        {
          data: {
            ...formValues,
            review: review.id,
            commented_at: new Date().toISOString(),
            publishedAt: null,
          },
        }
      )
      .then(() => {
        setCommentSubmitted(true);
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          setCommentSubmitted(false);
          setCommentFormShow(false);
        }, 4000);
        window.scrollTo({ top: 0, behavior: "smooth" });

        formData.current = { name: "", text: "" };
        const inputs = document.querySelectorAll("#js-comments-add input");
        inputs.forEach((input) => {
          input.value = "";
        });
        const textAreas = document.querySelectorAll(
          "#js-comments-add textarea"
        );
        textAreas.forEach((textArea) => {
          textArea.value = "";
        });
      });
  };

  useEffect(() => {
    axios(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/comments?filters[featured][$eq]=true&filters[parent_comment][$null]=true`,
      {
        params: {
          populate:
            "author.avatar,media,meta,comments.author.avatar,comments.comment,comments.comment.author.avatar,post_category",
          "pagination[pageSize]": 18,
        },
      }
    );
    if (showArticleMenu) {
      const wysiwig = document.querySelectorAll(".wysiwyg-content h2");
      const menu = [];
      for (let i = 0; i < wysiwig.length; i++) {
        const element = wysiwig[i];
        menu.push({ link: `toc-${i}`, label: element.innerText });
      }
      setContentMenu(menu);
    }
  }, [showArticleMenu]);

  if (!review) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{review.meta.title}</title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta name="description" content={review.meta.description} />
        <link
          rel="canonical"
          href={`${baseClientUrl}/${review.review_category.slug}/${review.slug}/`}
        />
        <link rel="icon" href="/favicon.ico" />
        {/* Yandex.Metrika counter */}
        <script type="text/javascript">
          {`
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {
          if (document.scripts[j].src === r) { return; }
        }
        k=e.createElement(t),
        a=e.getElementsByTagName(t)[0],
        k.async=1,
        k.src=r,
        a.parentNode.insertBefore(k,a)
      })
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym(101050218, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
      });
    `}
        </script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/101050218"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
      </Head>
      <div className="bottom-mobile-menu">
        <div className="inner">
          <Link href={review.external_link} {...linkConfig}>
            <img
              src={generalOption.bottom_icons[0].icon}
              alt={generalOption.bottom_icons[0].label}
            />
            <span>{generalOption.bottom_icons[0].label}</span>
          </Link>
          <Link href="#brokers-show__feedback">
            <img
              src={generalOption.bottom_icons[1].icon}
              alt={generalOption.bottom_icons[1].label}
            />
            <span>{generalOption.bottom_icons[1].label}</span>
          </Link>
        </div>
      </div>
      {commentSubmitted && (
        <div className="alert-wrapper" role="alert">
          <div className="alert alert-primary">
            Отзыв отправлен. Он появится после проверки
          </div>
        </div>
      )}
      <div className="content-inside brokers-show">
        <div className="content-top">
          <Breadcrumbs
            className="!pb-0"
            items={[
              { url: "/", title: "Главная" },
              {
                url: `/${review.review_category.slug}`,
                title: review.review_category.title,
              },
              {
                url: `/${review.slug}/${review.slug}`,
                title: review.title,
              },
            ]}
          />
        </div>

        <div
          className="article-show"
          itemScope=""
          itemType="https://schema.org/Article"
        >
          {/*<link*/}
          {/*  itemProp="image"*/}
          {/*  href="https://invest-space.ru/storage/articles/1/2024/10/24/1-1729768424865117693-main.jpg"*/}
          {/*/>*/}
          <meta itemProp="headline" content={review.title} />

          <div className="top-page-info">
            <div
              className="top-page-info-inner"
              style={{
                backgroundImage: `url(${generalOption.review_background})`,
              }}
            >
              <div className="middle-part">
                <div className="w-fit flex items-center gap-5">
                  <img
                    className="block-logo"
                    src={review.logo}
                    alt={review.title}
                  />
                  <div className="page-reviews-info flex-col">
                    <span className="text-white">{review.title}</span>
                    <div className="w-fit flex gap-2">
                      <span className="text-white">{review?.rating}</span>
                      <Ratings
                        rating={review?.rating}
                        starImages={{
                          starEmpty: "/img/star-empty.svg",
                          starFull: "/img/star-full.svg",
                          starHalf: "/img/star-half.svg",
                        }}
                      />
                    </div>
                    <div className="inter-medium-white-12px">
                      <Link
                        href="#brokers-show__feedback"
                        className="to-comments-link"
                      >
                        Оставить отзыв
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="card-date-date">
                  <img
                    className="mingcutetime-line"
                    src="/img/mingcute-time-line.svg"
                    alt="Date"
                  />
                  <div className="date-text">
                    Актуально на {moment(review.publishedAt).format("MMM YYYY")}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {review.external_link != "#" && (
            <Link
              className="wide-btn"
              href={review.external_link}
              {...linkConfig}
            >
              <span>{generalOption.review_social_button_text}</span>
            </Link>
          )}
          <div className="top-triggers-wrapper">
            <div className="triggers-line">
              {triggerValues.map((item) => (
                <div key={item.id} className="trigger">
                  <div className="trigger-inside">
                    <div className="top-line">
                      <div className="trigger-value">{item.value}</div>
                      <img
                        className="trigger-icon"
                        src={item.icon}
                        alt={item.label}
                      />
                    </div>
                    <div className="bottom-line">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-company-title">Информация о компании</div>
          <div
            className="company-info-wrapper"
            itemScope=""
            itemType="https://schema.org/Organization"
          >
            {generalOption.company_info_widgets.map((item, index) => (
              <div key={item.id} className="info-unit">
                <img src={item.icon} alt={item.label} />

                <div className="unit-info">
                  <div className="unit-value" itemProp="foundingDate">
                    {review.company_info[index]?.link ? (
                      <Link href={review.company_info[index].link}>
                        {review.company_info[index].value}
                      </Link>
                    ) : (
                      review.company_info[index]?.value
                    )}
                  </div>

                  <div className="unit-caption">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="about-company-title">Плюсы и минусы</div>
          <div className="plus-and-minus-wrapper">
            <div className="inside">
              <div className="unit pluses">
                <ul>
                  {review.pros.map((item) => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
              </div>
              <div className="unit minuses">
                <ul>
                  {review.cons.map((item) => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="article-show__index">
            <a
              className="article-show__index-title cursor-pointer"
              data-toggle="collapse"
              role="button"
              aria-expanded="false"
              aria-controls="indexCollapse"
              onClick={() => setShowArticleMenu(!showArticleMenu)}
            >
              <span>Содержание</span>
              <img src="/img/icon-arrow-down-bold.svg" alt="Содержание" />
            </a>

            <div
              className={clsx("article-collapse", showArticleMenu && "show")}
              id="indexCollapse"
            >
              <div className="article-show__index-body">
                {contentMenu.map((item) => (
                  <p key={item.link}>
                    <Link href={`#${item.link}`}>{item.label}</Link>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="article-show__content" itemProp="articleBody">
            <WysiwigPanel content={review.content} />
          </div>

          <div className="brokers-summary-wrapper">
            <div className="brokers-summary-title">Итоги обзора</div>
            <div className="brokers-summary">
              <div className="graphics flex justify-center pt-4">
                <div className="w-3/4">
                  {chartOptions && (
                    <RingChart chartOptions={chartOptions} rating={rating} />
                  )}
                </div>
              </div>
              <div className="counts">
                {review.summary?.map((item) => (
                  <div key={item.id} className="count-item gap-2">
                    <div className="count-item-title whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.title}
                    </div>
                    <div className="count-item-value w-[117px] min-w-[117px] max-w-[117px]">
                      <div className="line-wrapper">
                        <div className="line">
                          <div
                            className="line-value"
                            style={{
                              width: `${Math.min(
                                100,
                                (100 / 5) * item.rating
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>{item.rating}/5</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <meta itemProp="author" content="Ксения Пронина" />
          <div className="article-show__feedback">
            <div className="article-show__feedback-author">
              <img
                className="article-show__feedback-author-avatar"
                src={generalOption.author.avatar}
                alt="Команда Crypto Space"
                width="56"
                height="56"
              />
              <div className="article-show__feedback-author-info">
                <div
                  className="article-show__feedback-author-name"
                  itemProp="author"
                >
                  {generalOption.author.name}
                </div>
                <div className="article-show__feedback-author-desc">
                  {generalOption.author.description}
                </div>
              </div>
            </div>

            <div id="js_article-show__feedback__stars_wrapper">
              <div className="article-show__feedback-rating">
                <div
                  className="rating-emojis js-rating-emoji rating-stars_disabled"
                  data-url-base="articles"
                >
                  <span
                    className={clsx("btn", voted === 0 && "selected")}
                    data-rate="2"
                    onClick={handleStars}
                  >
                    <span className="emoji">🔥</span>
                    <span className="counter">
                      {currentStars + (voted === 0 ? 1 : 0)}
                    </span>
                  </span>
                  <span
                    className={clsx("btn", voted === 1 && "selected")}
                    data-rate="1"
                    onClick={handleUpVote}
                  >
                    <span className="emoji">👍</span>
                    <span className="counter">
                      {currentUpVote + (voted === 1 ? 1 : 0)}
                    </span>
                  </span>
                  <span
                    className={clsx("btn", voted === -1 && "selected")}
                    data-rate="3"
                    onClick={handleDownVote}
                  >
                    <span className="emoji">👎</span>
                    <span className="counter">
                      {currentDownVote + (voted === -1 ? 1 : 0)}
                    </span>
                  </span>
                </div>

                <input
                  type="hidden"
                  name="item_id"
                  value="218"
                  id="js_stars_item_id"
                />
                {voted === -1 && (
                  <div className="notice">
                    Упс…подскажите в комментариях, что нужно исправить
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="common-comments" id="brokers-show__feedback">
            <div className="common-feedback__header">
              <div className="common-feedback__title">
                {generalOption.review_comments_title} {review.title}
              </div>
              <div
                className="review-button"
                onClick={() => setCommentFormShow(!commentFormShow)}
              >
                <span className="js-feedback-add-button">Добавить отзыв</span>
              </div>
            </div>

            <div
              className={clsx(
                "common-comments__do-comment",
                commentFormShow ? "" : "hidden"
              )}
              id="js-feedback-add"
            >
              <form
                method="POST"
                // action="https://invest-space.ru/exchange/reviews/store"
                className="common-comments-add__form"
                onSubmit={handleSubmit}
              >
                <input
                  type="hidden"
                  name="_token"
                  value="JMGLvY4Edz9Lz9tAbT28iw7LvRoDP0nDw1IXNt9U"
                />
                <input type="hidden" name="broker_id" value="14" />

                <div className="feedback-user-data-inside">
                  <div className="caption">
                    <p className="notice">
                      Мы не собираем персональные данные, можете указать любое
                      имя
                    </p>
                  </div>
                  <div className="user-fields">
                    <div className="user-fields-inside">
                      <div className="input-wrapper">
                        <div className="label">Ваше имя</div>
                        <input
                          type="text"
                          name="user_name"
                          id="comment-user-name"
                          required
                          title="Имя"
                          onChange={(e) =>
                            (formData.current.name = e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="common-comments-add__form-line-wrapper">
                  <div className="text-area">
                    <textarea
                      name="content"
                      id="comment-content"
                      className="text-31 laptop-desktoptext-s-14-reg"
                      placeholder="Написать комментарий..."
                      title="Написать комментарий..."
                      minLength={100}
                      required
                      onChange={(e) => (formData.current.text = e.target.value)}
                    ></textarea>
                    <button type="submit" className="button-send">
                      <img
                        className="iconarrow-right-bold"
                        src="/img/icon-arrow-right-bold.svg"
                        alt="Написать комментарий"
                      />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div
              className={clsx(
                "comments-list js-comments-list",
                (review.comments.filter((c) => !c.featured).length < 5 ||
                  loadMore) &&
                  "full-list"
              )}
            >
              {review.allow_thread && threadedComment && (
                <Fragment key={10000}>
                  <CommentBlock
                    comment={threadedComment}
                    className={
                      threadedComment.comments?.length
                        ? "comments-list-item_has-answer"
                        : ""
                    }
                    handleCommentUpVote={handleCommentUpVote}
                    rName={rndPairs[0]?.name || undefined}
                    rAvatar={rndPairs[0]?.avatar || undefined}
                    threaded
                  />
                  {threadedComment.comments?.map((childComment, k1) => (
                    <CommentBlock
                      key={childComment.id}
                      comment={childComment}
                      isAnswer
                      className="comment-answer"
                      handleCommentUpVote={handleCommentUpVote}
                      rName={rndPairs[k1 + 1]?.name || undefined}
                      rAvatar={rndPairs[k1 + 1]?.avatar || undefined}
                      threaded
                    />
                  ))}
                </Fragment>
              )}
              {review.comments
                .filter((c) => !c.featured)
                .slice(0, 4)
                .map((comment) => (
                  <Fragment key={comment.id}>
                    <CommentBlock
                      comment={comment}
                      className={
                        comment.comments?.length
                          ? "comments-list-item_has-answer"
                          : ""
                      }
                      handleCommentUpVote={handleCommentUpVote}
                    />
                    {comment.comments?.map((childComment) => (
                      <CommentBlock
                        key={childComment.id}
                        comment={childComment}
                        isAnswer
                        className="comment-answer"
                        handleCommentUpVote={handleCommentUpVote}
                      />
                    ))}
                  </Fragment>
                ))}

              <div
                className={clsx("more-comments-list", loadMore && "show")}
                id="js-more-comments-list"
              >
                {review.comments
                  .filter((c) => !c.featured)
                  .slice(4)
                  .map((comment) => (
                    <Fragment key={comment.id}>
                      <CommentBlock
                        comment={comment}
                        className={
                          comment.comments?.length
                            ? "comments-list-item_has-answer"
                            : ""
                        }
                        handleCommentUpVote={handleCommentUpVote}
                      />

                      {comment.comments?.map((childComment) => (
                        <CommentBlock
                          key={childComment.id}
                          comment={childComment}
                          className="comment-answer"
                          isAnswer
                          handleCommentUpVote={handleCommentUpVote}
                        />
                      ))}
                    </Fragment>
                  ))}
              </div>

              {review.comments.filter((c) => !c.featured).length > 4 &&
                !loadMore && (
                  <button
                    id="js-more-comments-list-btn-show"
                    type="button"
                    className="btn-more"
                    onClick={() => setLoadMore(true)}
                  >
                    <span>Показать еще</span>
                    <img src="/img/icon-load-more.svg" alt="" />
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
