import Link from "next/link";
import Head from "next/head";

const NotFoundPage = () => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Page not found</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="content-inside pages-show">
        <div className="article-show">
          <div className="article-show__content">
            <div className="error-page">
              <h1>404</h1>
              <div className="sub-title">
                Failed to load page
              </div>
              <div className="description">
                Nothing was found for your request, but you can find what you need on the main page
              </div>
              <div className="url">
                <Link href="/">Go to main page</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
