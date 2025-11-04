import axios from "axios";
import Head from "next/head";
import { baseClientUrl } from "@/constants/constants";
import { PostModel } from "@/models/post.model";
import { ReviewModel } from "@/models/review.model";
import SearchResult from "@/components/SearchResult";
import { SearchPageModel } from "@/models/search-page.model";
import { GeneralOptionModel } from "@/models/general-option.model";

export async function getServerSideProps({ query }) {
  let searchPage = null;
  let generalOption = null;

  let reviews = [];
  let search = query.search || null;

  let posts = [];
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
      review_background`,
      },
    }
  );

  if (generalOptionResponse.data?.data) {
    const payload = new GeneralOptionModel(generalOptionResponse.data.data);
    generalOption = JSON.parse(JSON.stringify(payload));
  }

  const [postsResponse, reviewsResponse] = await Promise.all([
    axios(
      `${API_BASE}/api/posts`,
      {
        params: {
          populate: {
            fields: "meta",
            author: {
              avatar: "*",
            },
            media: "*",
            post_category: "*",
            comments: {
              populate: "author.avatar,comment,comment.author.avatar",
              sort: "analogue_date:desc,commented_at:desc",
            },
          },
          "filters[$or][0][title][$contains]": search,
          "filters[$or][1][slug][$contains]": search,
          "pagination[pageSize]": 100,
        },
      }
    ),
    axios(
      `${API_BASE}/api/reviews`,
      {
        params: {
          populate: {
            author: "avatar",
            media: "*",
            logo: "*",
            meta: "*",
            pros: "*",
            cons: "*",
            summary: "*",
            company_info: "*",
            trigger_values: "*",
            content_menu: "*",
            review_category: "*",
            review_categories: "*",
            comments: {
              populate: "author.avatar,comment,comment.author.avatar",
              sort: "analogue_date:desc,commented_at:desc",
            },
          },
          "filters[$or][0][title][$containsi]": search,
          "filters[$or][1][slug][$containsi]": search,
          "filters[$or][2][name][$containsi]": search,
          "pagination[pageSize]": 100,
        },
      }
    ),
  ]);

  if (postsResponse.data?.data?.length) {
    posts.push(...postsResponse.data.data.map((post) => new PostModel(post)));
  }
  if (reviewsResponse.data?.data?.length) {
    reviews.push(
      ...reviewsResponse.data.data.map((post) => new ReviewModel(post))
    );
  }

  const searchPageResponse = await axios(
    `${API_BASE}/api/search-page`,
    {
      params: {
        populate: "meta",
      },
    }
  );

  if (searchPageResponse.data?.data) {
    const payload = new SearchPageModel(searchPageResponse.data.data);
    searchPage = JSON.parse(JSON.stringify(payload));
  }

  return {
    props: {
      reviews: JSON.parse(JSON.stringify(reviews)),
      posts: JSON.parse(JSON.stringify(posts)),
      searchPage,
      searchKey: search,
      generalOption,
    },
  };
}

export default function Search({
  reviews,
  posts,
  searchPage,
  searchKey,
  generalOption,
}) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${searchPage.meta.title}: ${searchKey}`}</title>
        <meta
          name="robots"
          content={generalOption.allow_indexation ? robotsTxt : "noindex"}
        />
        <meta name="description" content={`${searchPage.meta.description}`} />
        <link rel="canonical" href={`${baseClientUrl}/search/`} />
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
      <SearchResult
        reviews={reviews}
        posts={posts}
        searchKey={searchKey}
        searchPage={searchPage}
      />
    </>
  );
}
