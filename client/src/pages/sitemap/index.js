import Paginator from "@/components/Paginator";
import Head from "next/head";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import qs from "qs";
import axios from "axios";
import { GeneralOptionModel } from "@/models/general-option.model";
import { robotsTxt } from "@/constants/constants";

export async function getServerSideProps({ query }) {
  let page = query.page || 1;
  let generalOption = null;
const API_BASE = "http://127.0.0.1:1337";
  const generalOptionResponse = await axios.get(
    `${API_BASE}/api/general-option`,
    {
      params: {
        populate: `
      review_options.company_info_widgets.icon,
      review_options.widget_min_deposit_withdrawal,
      review_options.widget_trading_volume,
      review_options.widget_verification,
      review_options.widget_spot_commission,
      review_options.widget_futures_commission,
      review_background,
      site_logo`,
      },
    }
  );

  if (generalOptionResponse.data?.data) {
    const payload = new GeneralOptionModel(generalOptionResponse.data.data);
    generalOption = JSON.parse(JSON.stringify(payload));
  }

  const baseURL = API_BASE;
  const queryStr = qs.stringify({
    filters: {
      review_category: {
        $notNull: true,
      },
    },
    pagination: { page: page, pageSize: 100 },
    populate: {
      review_category: {
        fields: ["slug"],
      },
    },
    sort: ["is_indexed_value:asc", "publishedAt:desc"],
  });

  const response = await fetch(`${baseURL}/api/reviews?${queryStr}`);
  const data = await response.json();
  const links = data.data.map((r) => ({
    label: r.attributes.title,
    link: `/${r.attributes.review_category.data.attributes.slug}/${r.attributes.slug}`,
  }));

  return {
    props: {
      links,
      pageCount: data.meta.pagination.pageCount,
      page,
      generalOption,
    },
  };
}

export default function SitemapPage({ links, pageCount, page, generalOption }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>
          HTML карта (HTML Sitemap) сайта{" "}
          {process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"}
        </title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta
          name="description"
          content={`Список обзоров на сайте ${
            process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"
          } | Удобная навигация по HTML карте (HTML Sitemap)`}
        />
        <link
          rel="canonical"
          href={`${
            process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"
          }/sitemap/`}
        />
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
      <div className="content-inside">
        <div className="content-top">
          <Breadcrumbs
            items={[
              { url: "/", title: "Главная" },
              { url: `/sitemap`, title: "Sitemap" },
            ]}
          />
          <h1 itemProp="name">HTML карта</h1>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {links.map((link) => (
            <div
              key={link.link}
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              <span>
                ●{" "}
                <Link
                  href={link.link}
                  rel="noreferrer"
                  target="_blank"
                  className="break-words leading-normal"
                >
                  {link.label}
                </Link>
              </span>
            </div>
          ))}
        </div>
      </div>
      {pageCount > 1 && (
        <Paginator
          currentPage={page}
          pageCount={pageCount}
          baseURL="/sitemap"
          className="my-8"
        />
      )}
    </>
  );
}
