import axios from "axios";
import Head from "next/head";
import Breadcrumbs from "@/components/Breadcrumbs";
import CoinPriceWidget from "@/components/CoinPriceWidget.jsx";
import { baseClientUrl, robotsTxt } from "@/constants/constants";
import { Fragment, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import CommentBlock from "@/components/CommentBlock";
import Link from "next/link";
import NotFoundPage from "@/components/NotFoundPage";
import { CommentModel } from "@/models/comment.model";
import { getPostUrl } from "@/utils/getPostUrl";

export default function BlogPostPage({
  post,
  interestingPosts,
  generalOption,
  postPage,
  coinGeckoId,
}) {
  const cgId =
    coinGeckoId ??
    post?.coinGeckoId ??
    post?.attributes?.coinGeckoId ??
    post?.data?.attributes?.coinGeckoId ??
    null;

  console.log("coinGeckoId:", cgId);

  const [currentStars, setCurrentStars] = useState(generalOption.stars || 0);
  const [currentUpVote, setCurrentUpVote] = useState(generalOption.upvote || 0);
  const [currentDownVote, setCurrentDownVote] = useState(
    generalOption.downvote || 0
  );
  const formData = useRef({ name: "", text: "" });
  const timeout = useRef(null);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [voted, setVoted] = useState();
  const [comments] = useState(post?.comments);
  const [threadedComment, setThreadedComment] = useState(false);
  const [rndPairs, setRndPairs] = useState([]);
  useEffect(() => {
    if (post.allow_thread && post.threaded_comment) {
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
                  $eq: post.threaded_comment,
                },
              },
            },
          }
        );
        setThreadedComment(new CommentModel(res.data.data[0]));
      };
      fetchComment();
      setRndPairs(JSON.parse(post.random_avatar_name_pair));
    }
  }, [post]);

  useEffect(() => {
    const votes = +localStorage.getItem("iv_voted");
    setVoted(votes);
    if (votes === 0) {
      setCurrentStars(generalOption.stars - 1);
    } else if (votes === 1) {
      setCurrentUpVote(generalOption.upvote - 1);
    } else if (votes === -1) {
      setCurrentDownVote(generalOption.downvote - 1);
    }
  }, []);

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
    const votes = +localStorage.getItem("iv_voted");
    if (votes === 0) return;
    updateStates(0);
  };

  const handleUpVote = () => {
    const votes = +localStorage.getItem("iv_voted");
    if (votes === 1) return;
    updateStates(1);
  };

  const handleDownVote = () => {
    const votes = +localStorage.getItem("iv_voted");
    if (votes === -1) return;
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

  const handleCommentDownVote = (id, data) => {
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
            post: post.id,
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

  if (!post) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{post.meta.title}</title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta name="description" content={post.meta.description} />
        <meta name="author" content="Команда Crypto Space" />
        <link
          rel="canonical"
          href={`${baseClientUrl}${getPostUrl(post)}/`}
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
      {commentSubmitted && (
        <div className="alert-wrapper" role="alert">
          <div className="alert alert-primary">
            Комментарий отправлен. Он появится после проверки
          </div>
        </div>
      )}
      <div className="content-inside articles-show">
        <div className="content-top">
          <Breadcrumbs
            items={[
              { url: "/", title: "Главная" },
              {
                url: `/${post.post_category.slug}`,
                title: post.post_category?.name || post.post_category?.title || "Статьи"
              },
              {
                url: getPostUrl(post),
                title: post.title,
              },
            ]}
          />
          <h1 itemProp="name">{post.title}</h1>
          {cgId && (
            <CoinPriceWidget
              coinGeckoId={cgId}
              apiBase={
                process.env.NEXT_PUBLIC_API_ENDPOINT ||
                "http://127.0.0.1:1337"
              }
            />
          )}
        </div>

        <div
          className="article-show"
          itemScope=""
          itemType="https://schema.org/Article"
        >
          <link
            itemProp="image"
            href="https://invest-space.ru/storage/articles/1/2024/10/24/1-1729768424865117693-main.jpg"
          />
          <meta
            itemProp="headline"
            content="Как перевести токены с HTX на HTX: пошаговый гайд"
          />

          <div
            className="article-show__short-desc common-short-desc"
            itemProp="articleBody"
          >
            <div
              className="wysiwyg-content"
              dangerouslySetInnerHTML={{ __html: post.post_content }}
            ></div>
          </div>

          <div className="article-show__content">
            <div className="wysiwyg-content"></div>
          </div>

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

          <div className="block-wrapper">
            <div className="block-title">
              <div className="block-title-inside">
                <div className="laptop-desktoph2-sb-30">
                  {postPage.interesting_posts_text}
                </div>
                <div className="text-button">
                  <Link
                    href={postPage.see_all_posts_link}
                    className="text-3 laptop-desktoptext-s-14-reg"
                  >
                    {postPage.see_all_posts_text}
                  </Link>
                </div>
              </div>
            </div>
            <div className="articles-list-wrapper">
              <div className="articles-list">
                {interestingPosts.map((post) => (
                  <a
                    key={post.id}
                    href={getPostUrl(post)}
                    className="article-block"
                  >
                    <div
                      className="article-block-inner"
                      style={{ backgroundImage: `url(${post.media})` }}
                    >
                      <div className="article-block-title">{post.title}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="common-comments" id="comments">
            <div className="common-comments__header">
              <div className="common-comments__title">
                Все комментарии пользователей
              </div>
              <div className="common-comments__do-comment" id="js-comments-add">
                <form
                  method="POST"
                  className="common-comments-add__form "
                  onSubmit={handleSubmit}
                >
                  <input
                    type="hidden"
                    name="_token"
                    value="zoIosVseR8deDrB0vrvGjQYvn1nd0Hl3gjkIOiqF"
                  />
                  <input type="hidden" name="item_id" value="218" />

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
                        onChange={(e) =>
                          (formData.current.text = e.target.value)
                        }
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
            </div>

            <div
              className={clsx(
                "comments-list js-comments-list",
                (comments.filter((c) => !c.featured).length < 5 || loadMore) &&
                  "full-list"
              )}
            >
              {post.allow_thread && threadedComment && (
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
                  {threadedComment.comments?.map((childComment) => (
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
              {comments
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

                    {comment.comments?.slice(0, 4).map((comment) => (
                      <CommentBlock
                        key={comment.id}
                        comment={comment}
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
                {comments
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

                      {comment.comments?.map((comment) => (
                        <CommentBlock
                          key={comment.id}
                          comment={comment}
                          className="comment-answer"
                          isAnswer
                          handleCommentUpVote={handleCommentUpVote}
                        />
                      ))}
                    </Fragment>
                  ))}
              </div>

              {comments.filter((c) => !c.featured).length > 4 && !loadMore && (
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
