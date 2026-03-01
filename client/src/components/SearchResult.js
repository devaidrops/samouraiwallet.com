import Link from "next/link";
import { useMemo } from "react";
import { getPostUrl } from "@/utils/getPostUrl";

const SearchResult = ({ posts, reviews, searchKey, searchPage }) => {
  const totalSearchResults = posts.length + reviews.length;

  const totalSearchResultsText = useMemo(() => totalSearchResults > 4
    ? "items" : totalSearchResults > 1 ? "items" : "item", [totalSearchResults]);

  return (
    <div className="content-inside search-index">
      <div className="content-top">

        <h1>Search results for: {searchKey}</h1>

        <div className="page-desc laptop-desktoptext-m-15-reg">
          Found {totalSearchResults} {totalSearchResultsText}
        </div>
      </div>

      <div className="results-inside">
        {posts.length > 0 || reviews.length > 0 ? (
          <>
            {posts.length > 0 && (
              <>
                <h3>{searchPage.blog_section_title}</h3>
                <ul>
                  {posts.map((post) => (
                    <li key={post.id}>
                      <Link href={getPostUrl(post)}>{post.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {reviews.length > 0 && (
              <>
                <h3>{searchPage.review_section_title}</h3>
                <ul>
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <Link href={`/${review.review_category.slug}/${review.slug}`}>{review.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <>
            <h3>Nothing found</h3>
            <div className="notice-text">
              Check your query or refresh the page
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResult;
