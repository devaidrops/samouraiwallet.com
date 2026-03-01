import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

const Header = ({ menu, generalOption }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchKeyValid, setSearchKeyValid] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(undefined);

  const handleActiveMobileMenu = (e, index) => {
    e.preventDefault();
    setActiveMobileMenu((prevIndex) =>
      prevIndex === index ? undefined : index
    );
  };

  const handleCloseMobileMenu = (e) => {
    e.preventDefault();
    setShowMobileMenu(false);
    setActiveMobileMenu(undefined);
  };

  const handleSearchInputChange = (e) => {
    setSearchKeyValid(!!e.target.value);
  };

  return (
    <div className="header-wrapper">
      <header>
        <img
          className="menu-burger"
          id="js-mobile-menu-burger"
          src="/img/icon-menu-burger.svg"
          alt=""
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        />

        <Link href="/" className="logo">
          {generalOption?.site_logo ? (
            <img
              src={generalOption.site_logo}
              alt="Coin Explorers"
              style={{ height: '40px', width: 'auto' }}
            />
          ) : (
            'Coin Explorers'
          )}
        </Link>

        <div className="menu-desktop">
          {menu.items.data.map((item) => (
            <article key={item.id} className="links ">
              <div className="laptop-desktoptext-m-15-reg">
                <Link href={item.attributes.url || "#"} className="text-url">
                  {item.attributes.title}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div
          className={clsx("main-mobile-menu", showMobileMenu && "active")}
          id="js-mobile-menu"
        >
          <div className="menu-wrapper">
            <div className="logo-line">
              <a href="">
                <img
                  className="menu-logo"
                  src={generalOption?.site_logo || "/img/logo-blue.svg"}
                  alt="Coin Explorers"
                />
              </a>

              <img
                className="menu-close"
                id="js-mobile-menu-close"
                src="/img/icon-menu-lose.svg"
                alt=""
                onClick={handleCloseMobileMenu}
              />
            </div>

            <ul>
              <li className="nav-item">
                  {menu.items.data.map((item) => (
                    <Link
                      key={item.id}
                      href={item.attributes.url || "#"}
                      className="dropdown-item"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {item.attributes.title}
                    </Link>
                  ))}
              </li>
            </ul>
          </div>
        </div>
        <div className="header-icons">
          <img
            className="iconsearch-line"
            id="js-header-search__show"
            src="/img/icon-search-line.svg"
            alt="icon/search-line"
            onClick={() => setSearchExpanded(!searchExpanded)}
          />
        </div>

        <div
          className={clsx(
            "header-search",
            searchExpanded && "header-search_expanded"
          )}
          id="js-header-search"
        >
          <form
            className="header-search__form"
            id="js-header-search__form"
            action="/search"
            itemProp="potentialAction"
            itemScope=""
            itemType="https://schema.org/SearchAction"
          >
            <meta itemProp="target" content="/search?search={query}" />

            <div className="input-wrapper">
              <input
                type="text"
                name="search"
                id="js-header-search__form-input"
                className="header-search__form-input"
                itemProp="query"
                placeholder="Search the site..."
                onChange={handleSearchInputChange}
              />

              <button
                type="submit"
                className={clsx(
                  "button-search",
                  searchKeyValid && "!opacity-100"
                )}
              >
                <img
                  className="iconsearch"
                  src="/img/icon-search.svg"
                  alt="Search"
                />
              </button>
            </div>

            <img
              className="iconlose-line"
              id="js-header-search__hide"
              src="/img/icon--lose-line.svg"
              alt="icon/lose-line"
              onClick={() => setSearchExpanded(!searchExpanded)}
            />

            <meta itemProp="query-input" content="required name=query" />
          </form>
        </div>
      </header>
    </div>
  );
};

export default Header;
