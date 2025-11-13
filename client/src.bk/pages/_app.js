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
  } = props;

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
      <Header menu={headerMenu} />
      <div id="app-content" itemScope="" itemType="https://schema.org/WebPage">
        <meta itemProp="inLanguage" content="ru-RU" />
        <meta
          itemProp="name"
          content="Как перевести токены с HTX на HTX: пошаговый гайд"
        />
        <meta
          itemProp="description"
          content="На HTX доступны два вида внутренних переводов: между своими аккаунтами и между разными пользователями. Как перевести токены в HTX без комиссии?"
        />
        <meta itemProp="isPartOf" content={`${baseClientUrl}/#website`} />
        <meta itemProp="datePublished" content="2024-10-24" />
        <meta itemProp="dateModified" content="2024-12-16" />

        <div className="overlap-group-container">
          <div className="content-wrapper">
            <Component {...pageProps} />
          </div>

          <Sidebar appId={appId} data={sidebar} recentReviews={recentReviews} />
        </div>
      </div>
      <Footer menu={footerMenu} copyrightMenu={footerCopyrightMenu} />
    </div>
  );
}

App.getInitialProps = async ({ router }) => {
  let headerMenu = { items: { data: [] } };
  let footerMenu = { items: { data: [] } };
  let footerCopyrightMenu = { items: { data: [] } };
  let sidebar = null;
  let recentReviews = [];

  console.log(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
    }/api/menus`
  );

  await axios
    .get(
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/menus`,
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
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/sidebar`,
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
      `${
        process.env.NEXT_PUBLIC_API_ENDPOINT ?? "http://127.0.0.1:1337"
      }/api/reviews`,
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
    },
  };
};
