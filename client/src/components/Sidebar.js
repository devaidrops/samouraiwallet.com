import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import axios from "axios";
import { getPostUrl } from "@/utils/getPostUrl";

const Sidebar = ({ appId, data, recentReviews, recentPosts }) => {
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizSelected, setQuizSelected] = useState(0);
  const [selectedQuizId, setSelectedQuizId] = useState();

  const handleCalcQuiz = (options) => {
    const sum = options.reduce((acc, option) => acc + option.upvotes, 0);
    const votes = Array.from(new Set(options.map((option) => option.upvotes)));
    const maxVotes = Math.max(...votes);

    setQuizOptions(
      options.map((option) => ({
        ...option,
        percent: Math.round((option.upvotes / (sum || 1)) * 100),
        isMax: votes.length > 1 && maxVotes === option.upvotes,
      }))
    );
  };

  useEffect(() => {
    const selected = sessionStorage.getItem("_iv_so");
    setQuizSelected(selected ? 2 : 1);
    if (data?.quiz?.quiz_options) {
      handleCalcQuiz(data.quiz.quiz_options);
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const options = quizOptions.map((option) => ({
      ...option,
      upvotes: option.upvotes + (option.id === selectedQuizId ? 1 : 0),
    }));

    axios
      .put(
        `${
          process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
        }/api/sidebar`,
        {
          data: {
            quiz: {
              quiz_options: options,
            },
          },
        }
      )
      .then(() => {
        handleCalcQuiz(options);
        sessionStorage.setItem("_iv_so", "1");
        setQuizSelected(2);
      });
  };

  return (
    <div className="sidebar">
      <div className="inside">
        {data.current_reviews_heading_img &&
          data.current_reviews_title &&
          data.current_reviews.length > 0 && (
            <div className="actual">
              <div className="text-8">
                <img
                  className="image-211"
                  src={data.current_reviews_heading_img}
                  alt="image 211"
                />
                <div className="text laptop-desktoph2-sb-30">
                  {data.current_reviews_title}
                </div>
              </div>
              <div className="content">
                {data.current_reviews.map((review) => (
                  <article key={review.id} className="desk-actual">
                    <div className="text-9">
                      <p className="text-4 laptop-desktoptext-l-16-med">
                        <Link
                          href={`/${review.review_category.slug}/${review.slug}`}
                          className="text-url"
                          rel="nofollow"
                        >
                          {review.title}
                        </Link>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        {recentPosts && recentPosts.length > 0 && data.current_posts_heading_img && data.current_posts_title && (
        <div className="actual">
          <div className="text-8">
            <img
              className="image-211"
              src={data.current_posts_heading_img}
              alt="image 211"
            />
            <div className="text laptop-desktoph2-sb-30">
              {data.current_posts_title}
            </div>
          </div>
          <div className="content">
            {recentPosts.map((item) => {
              const isPost = item.attributes.post_category?.data;
              const href = isPost
                ? getPostUrl({
                    slug: item.attributes.slug,
                    post_category: item.attributes.post_category?.data?.attributes,
                  })
                : `/${item.attributes.slug}`;

              return (
                <article key={item.id} className="desk-actual">
                  <div className="text-9">
                    <p className="text-4 laptop-desktoptext-l-16-med">
                      <Link
                        href={href}
                        className="text-url"
                        rel="nofollow"
                      >
                        {item.attributes.title}
                      </Link>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        )}
        {data?.quiz?.quiz_options?.length > 0 && (
        <div className="quiz">
          <div className="text-13">
            <img
              className="image-209"
              src="/img/image-209.png"
              alt="image 209"
            />
            <div className="text laptop-desktoph2-sb-30">Survey</div>
          </div>
          <div className="content-1 content-3">
            <div className="x-3">
              <p className="polls-title">{data.quiz?.question}</p>
              <div className="x-4 js-poll-body">
                {quizSelected === 1 && (
                  <form
                    className="poll-form js-poll-form"
                    action="https://invest-space.ru/polls/votes/store"
                    method="post"
                    onSubmit={handleSubmit}
                  >
                    <input type="hidden" name="_token" value={appId} />
                    <div className="poll-form__options">
                      {quizOptions.map((option) => (
                        <div key={option.id} className="custom-radio-wrapper">
                          <input
                            type="radio"
                            id={`widget_1-poll_17-radio_${option.id}`}
                            name="option_id"
                            value={option.id}
                            className="custom-control-input"
                            onChange={() => setSelectedQuizId(option.id)}
                          />
                          <label
                            className={clsx(
                              "custom-control-label",
                              selectedQuizId === option.id && "clicked"
                            )}
                            htmlFor={`widget_1-poll_17-radio_${option.id}`}
                          >
                            {option.option_text}
                          </label>
                        </div>
                      ))}
                    </div>
                    <input type="hidden" name="poll_id" value="17" />
                    <div className="align-center">
                      <button type="submit" className="btn">
                      Vote
                      </button>
                    </div>
                  </form>
                )}

                {quizSelected === 2 &&
                  quizOptions.map((option) => (
                    <article
                      key={option.id}
                      className="desk-quiz poll-result-option poll-result-option_max"
                    >
                      <div className="quiz-text laptop-desktoptext-s-14-reg">
                        {option.option_text}
                      </div>
                      <div
                        className={clsx(
                          "line",
                          option.isMax ? "line-blue" : "line-grey"
                        )}
                        style={{ width: `${option.percent}%` }}
                        aria-valuenow={option.percent}
                      />
                      <div className={option.isMax ? "percent-8" : "percent-5"}>
                        <div
                          className={clsx(
                            "laptop-desktopcaption-xs-10-reg",
                            option.isMax ? "percent-9" : "percent-1"
                          )}
                        >
                          {option.percent}%
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
