import Link from "next/link";
import { baseClientUrl } from "@/constants/constants";
import clsx from "clsx";
import { Fragment } from "react";

const Breadcrumbs = ({ items, className }) => {
  return (
    <div
      className={clsx("breadcrumb", className)}
      itemScope=""
      itemType="https://schema.org/BreadcrumbList"
      aria-label="breadcrumb"
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          <div
            className={clsx("breadcrumb-item", index + 1 === items.length && "active pointer-events-none")}
            itemProp="itemListElement"
            itemScope=""
            itemType="https://schema.org/ListItem"
            {...(index + 1 === items.length ? { "aria-current": "page" } : {})}
          >
            {index + 1 === items.length && <link itemProp="item" href={`${baseClientUrl}${item.url}`} />}
            {index + 1 === items.length ? (
              <span
                className="inline !my-0 !leading-none !font-normal !text-inherit breadcrumb-last-text"
                itemProp="name"
              >{item.title}</span>
            ) : (
              <Link href={item.url} className="text-url" itemProp="item">
                <span itemProp="name">{item.title}</span>
              </Link>
            )}
            <meta itemProp="position" content={index + 1} />
          </div>
          {index + 1 !== items.length && <div className="breadcrumb-item"> / </div>}
        </Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
