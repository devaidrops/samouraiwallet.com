import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";
import { viewFullDateTime } from "@/utils/date.util";
import WysiwigPanel from "@/components/WysiwigPanel";
import SimpleModal from "@/components/SimpleModal";

const CommentBlock = ({
  comment,
  isAnswer,
  className,
  showVotes = true,
  handleCommentUpVote,
  handleCommentDownVote,
  rName = "",
  rAvatar = "",
  threaded = false,
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [currentUpVotes, setCurrentUpVotes] = useState(comment.upvote || 0);
  const [currentDownVotes, setCurrentDownVotes] = useState(
    comment.downvote || 0
  );
  const [commentText] = useMemo(() => {
    const changedText = comment.text.replace(
      /(http[s*]?:\/\/)([^ ]+)/g,
      '<a target="_blank" href="$&" rel="nofollow">$1$2</a>'
    );
    return [changedText];
  }, [comment]);

  const commentDate = useMemo(() => {
    return viewFullDateTime(comment.analogue_date || comment.commented_at);
  }, [comment]);

  const handleUpVote = () => {
    if (handleCommentUpVote) {
      const key = "_iv_co_u"; // Comments Upvoted
      const upVotedCommentIds = sessionStorage.getItem(key) || "";
      const ids = upVotedCommentIds.split(",").map(Number);
      if (ids.includes(comment.id)) return;
      handleCommentUpVote(comment.id, {
        data: { upvote: currentUpVotes + 1 },
      }).then(() => {
        setCurrentUpVotes(currentUpVotes + 1);
        sessionStorage.setItem(key, [...ids, comment.id].join(","));
      });
    }
  };

  const handleDownVote = () => {
    if (handleCommentDownVote) {
      const key = "_iv_co_d"; // Comments Downvoted
      const upVotedCommentIds = sessionStorage.getItem(key) || "";
      const ids = upVotedCommentIds.split(",").map(Number);
      if (ids.includes(comment.id)) return;
      handleCommentDownVote(comment.id, {
        data: { downvote: currentDownVotes + 1 },
      }).then(() => {
        setCurrentDownVotes(currentDownVotes + 1);
        sessionStorage.setItem(key, [...ids, comment.id].join(","));
      });
    }
  };

  return (threaded && rAvatar) || !threaded ? (
    <>
      <div
        className={clsx("comment comments-list-item", className)}
        id="comment-811"
        itemProp="comment"
        itemScope=""
        itemType="https://schema.org/Comment"
      >
        {rAvatar && (
          <img
            className="comment-avatar"
            src={
              (process.env.NEXT_PUBLIC_API_ENDPOINT ??
                "http://127.0.0.1:1337") + rAvatar
            }
            alt={rName}
            width="40"
            height="40"
          />
        )}
        {!rAvatar &&
          (comment.author?.avatar ? (
            <img
              className="comment-avatar"
              src={comment.author?.avatar}
              alt={comment.author?.name}
              width="40"
              height="40"
            />
          ) : (
            <img
              className="comment-avatar"
              src="/img/default-avatar.png?id=756caeb651ce93406994"
              alt="Avatar"
              width="50"
              height="50"
              loading="lazy"
            />
          ))}

        <div className="comment-body">
          <div className="name-date">
            <div
              className="comment-author"
              itemProp="author"
              itemScope=""
              itemType="https://schema.org/Person"
            >
              {rName || comment.author?.name || comment.name}
            </div>
            <div className="comment-date" itemProp="dateCreated">
              {commentDate}
            </div>
          </div>
          <div className="comment-text" itemProp="text">
            <WysiwigPanel id={`wysiwyg-${comment.id}`} content={commentText} />
          </div>
          {comment.attachments?.length > 0 && (
            <div className="w-fit mb-2 flex gap-2 items-center">
              {comment.attachments.map((attachment, index) => (
                <Image
                  key={index}
                  src={attachment}
                  alt="comment attachment"
                  width={60}
                  height={60}
                  className="cursor-pointer"
                  onClick={() => setSelectedAttachment(attachment)}
                />
              ))}
            </div>
          )}
          {showVotes && (
            <div className="buttons comments-list-item__rates">
              <div
                data-comment-id={comment.id}
                data-sign="1"
                className="thumbs comments-list-item__rate comments-list-item__rate_up js-comments-list-item__rate"
                role="button"
                itemProp="upvoteCount"
                onClick={handleUpVote}
              >
                <img
                  className="thumb-icon thumb-up  active "
                  src="/img/icon-thumbs-up.svg"
                  alt="Dislike"
                />
                <div className="thumb-counter">{currentUpVotes}</div>
              </div>
              {handleCommentDownVote && (
                <div
                  data-comment-id={comment.id}
                  data-sign="-1"
                  className="thumbs comments-list-item__rate comments-list-item__rate_down js-comments-list-item__rate"
                  role="button"
                  itemProp="downvoteCount"
                  onClick={handleDownVote}
                >
                  <img
                    className="thumb-icon thumb-down "
                    src="/img/icon-thumbs-down.svg"
                    alt="Dislike"
                  />
                  <div className="thumb-counter">{currentDownVotes}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {isAnswer && (
          <img
            className="comment-answer-line"
            src="/img/comment-answer-line.svg"
            alt="Answer"
          />
        )}
      </div>
      {selectedAttachment && (
        <SimpleModal onClose={() => setSelectedAttachment(null)}>
          <div
            className="min-w-full min-h-[60vh] w-full h-full flex bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${selectedAttachment})` }}
          ></div>
        </SimpleModal>
      )}
    </>
  ) : null;
};

export default CommentBlock;
