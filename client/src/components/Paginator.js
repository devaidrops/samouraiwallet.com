import { Fragment, useCallback, useMemo } from "react";
import querystring from "querystring";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

const Paginator = ({
  currentPage,
  pageCount,
  baseURL,
  queryKey = "page",
  className,
  considerBasePath = true,
}) => {
  const router = useRouter();
  const baseQuery = useCallback(
    (index) => {
      const query = querystring.parse(router.asPath.split("?")[1]);
      if (considerBasePath && index == 1) {
        delete query[queryKey];
      } else {
        query[queryKey] = index;
      }

      const queryPath = querystring.stringify(query);
      return queryPath ? `?${queryPath}` : "";
    },
    [router, queryKey]
  );

  return (
    <nav className={clsx("nav-pagination", className)}>
      <ul className="pagination">
        <li className={clsx("page-item", currentPage == 1 && "disabled")}>
          {currentPage == 1 ? (
            <span className="page-link" aria-hidden="true">
              &lt;
            </span>
          ) : (
            <Link
              className="page-link"
              href={`${baseURL}${baseQuery(1)}`}
              rel="prev"
              aria-label="« Prev"
            >
              &lt;
            </Link>
          )}
        </li>

        {Array(pageCount)
          .fill(0)
          .map((_, index) => (
            <Fragment key={index}>
              {index + 1 == currentPage ? (
                <li className="page-item active" aria-current="page">
                  <span className="page-link">{index + 1}</span>
                </li>
              ) : (
                <li className="page-item">
                  <Link
                    className="page-link"
                    href={`${baseURL}${baseQuery(index + 1)}`}
                  >
                    {index + 1}
                  </Link>
                </li>
              )}
            </Fragment>
          ))}

        <li
          className={clsx("page-item", currentPage == pageCount && "disabled")}
        >
          {currentPage == pageCount ? (
            <span className="page-link" aria-hidden="true">
              &gt;
            </span>
          ) : (
            <Link
              className="page-link"
              href={`${baseURL}${baseQuery(pageCount)}`}
              rel="next"
              aria-label="Next »"
            >
              &gt;
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Paginator;
