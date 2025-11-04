import { Fragment } from "react";
import Link from "next/link";
import Head from "next/head";
import Breadcrumbs from "@/components/Breadcrumbs";
import { baseClientUrl, robotsTxt } from "@/constants/constants";
import Paginator from "@/components/Paginator";
import NotFoundPage from "@/components/NotFoundPage";

export default function BlogCategoryPage({
  postCategory,
  posts,
  pageCount,
  page,
  generalOption,
}) {
  const currentPage = +(page || 1);

  if (page > pageCount) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${postCategory.meta?.title}${
          page ? ` (${page})` : ""
        }`}</title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta
          name="description"
          content={`${postCategory.meta?.description}${
            page ? ` (${page})` : ""
          }`}
        />
        <meta name="author" content="" />
        <link rel="canonical" href={`${baseClientUrl}/${postCategory.slug}/`} />
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

      <div className="content-inside articles-show">
        <div className="content-top">
          <Breadcrumbs
            items={[
              { url: "/", title: "Главная" },
              { url: `/${postCategory.slug}`, title: postCategory.name },
            ]}
          />
          <h1 itemProp="name">{postCategory.title}</h1>
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
              currentPage={currentPage}
              pageCount={pageCount}
              baseURL={`/${postCategory.slug}`}
            />
          )}
        </div>
      </div>
    </>
  );
}
