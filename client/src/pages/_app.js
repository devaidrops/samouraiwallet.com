import "@/styles/external.css";
import "@/styles/globals.scss";

import axios from "axios";
import { Inter } from "next/font/google";
import clsx from "clsx";
import { v4 } from "uuid";
import { useMemo } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { baseClientUrl } from "@/constants/constants";
import { SidebarModel } from "@/models/sidebar.model";
import setupAxios from "@/pages/setupAxios";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

setupAxios();

export default function App({ Component, pageProps, props }) {
  const {
    headerMenu,
    footerMenu,
    footerCopyrightMenu,
    sidebar,
    recentReviews,
    recentPosts,
  } = props;
  
  // Get generalOption from pageProps if present
  const generalOption = pageProps?.generalOption || null;

  const appId = useMemo(() => {
    if (typeof localStorage !== "undefined") {
      const appKey = "_iv_app_id";
      let id = localStorage.getItem(appKey);
      if (!id) {
        id = v4();
        localStorage.setItem(appKey, id);
      }
      return id;
    }
  }, []);

  return (
    <div className={clsx(inter.className, "cryptospace screen site_width")}>
      <Header menu={headerMenu} generalOption={generalOption} />
      <div id="app-content" itemScope="" itemType="https://schema.org/WebPage">
        <meta itemProp="inLanguage" content="en" />
        <meta
          itemProp="name"
          content="How to transfer tokens from HTX to HTX: step-by-step guide"
        />
        <meta
          itemProp="description"
          content="HTX offers two types of internal transfers: between your own accounts and between different users. How to transfer tokens on HTX with no fee?"
        />
        <meta itemProp="isPartOf" content={`${baseClientUrl}/#website`} />
        <meta itemProp="datePublished" content="2024-10-24" />
        <meta itemProp="dateModified" content="2024-12-16" />

        <div className="overlap-group-container">
          <div className="content-wrapper">
            <Component {...pageProps} />
          </div>

          <Sidebar appId={appId} data={sidebar} recentReviews={recentReviews} recentPosts={recentPosts} />
        </div>
      </div>
      <Footer menu={footerMenu} copyrightMenu={footerCopyrightMenu} generalOption={generalOption} />
    </div>
  );
}

App.getInitialProps = async ({ router }) => {
  let headerMenu = { items: { data: [] } };
  let footerMenu = { items: { data: [] } };
  let footerCopyrightMenu = { items: { data: [] } };
  let sidebar = null;
  let recentReviews = [];
  let recentPosts = [];
  const API_BASE = "http://127.0.0.1:1337";
  console.log(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
    }/api/menus`
  );

  await axios
    .get(
      `${API_BASE}/api/menus`,
      { params: { nested: true, populate: "*" } }
    )
    .then((data) => {
      const menus = data.data.data;
      headerMenu = menus.find((menu) => menu.attributes.slug === "header-menu")
        ?.attributes || { items: { data: [] } };
      footerMenu = menus.find((menu) => menu.attributes.slug === "footer-menu")
        ?.attributes || { items: { data: [] } };
      footerCopyrightMenu = menus.find(
        (menu) => menu.attributes.slug === "footer-copyright-menu"
      )?.attributes || { items: { data: [] } };
    });

  await axios
    .get(
      `${API_BASE}/api/sidebar`,
      {
        params: {
          nested: true,
          populate:
            "current_reviews.reviews.review_category,current_reviews.heading_img,current_posts.posts.post_category,quiz.quiz_options,current_posts.heading_img",
        },
      }
    )
    .then((data) => {
      sidebar = JSON.parse(JSON.stringify(new SidebarModel(data.data.data)));
    });

  await axios
    .get(
      `${API_BASE}/api/reviews`,
      {
        params: {
          nested: true,
          sort: "publishedAt:desc",
          pagination: {
            page: 1,
            pageSize: 5,
          },
          populate: "review_category",
        },
      }
    )
    .then((data) => {
      recentReviews = data.data.data;
    });

  // Load latest posts and pages
  let posts = [];
  let pages = [];
  
  // Load posts
  await axios
    .get(
      `${API_BASE}/api/posts`,
      {
        params: {
          nested: true,
          sort: "publishedAt:desc",
          pagination: {
            page: 1,
            pageSize: 5,
          },
          populate: "post_category",
        },
      }
    )
    .then((data) => {
      posts = data.data.data || [];
    })
    .catch(() => {
      posts = [];
    });

  // Load pages
  await axios
    .get(
      `${API_BASE}/api/pages`,
      {
        params: {
          nested: true,
          sort: "publishedAt:desc",
          pagination: {
            page: 1,
            pageSize: 5,
          },
        },
      }
    )
    .then((data) => {
      pages = data.data.data || [];
    })
    .catch(() => {
      pages = [];
    });

  // Merge posts and pages, sort by date and take 5 latest
  recentPosts = [...posts, ...pages]
    .sort((a, b) => new Date(b.attributes.publishedAt) - new Date(a.attributes.publishedAt))
    .slice(0, 5);

  return {
    ...(router.asPath.endsWith(".html")
      ? {}
      : {
          redirect: {
            permanent: true,
            destination: `${router.asPath}.html`,
          },
        }),
    props: {
      headerMenu,
      footerMenu,
      footerCopyrightMenu,
      sidebar,
      recentReviews,
      recentPosts,
    },
  };
};
