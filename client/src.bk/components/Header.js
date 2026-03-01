import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

const Header = ({ menu }) => {
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

        <Link href="/">
          <Image
            className="logo-blue"
            src="/img/logo.svg"
            alt="Coin Explorers"
            width={190}
            height={80}
            style={{ height: "50px", width: "auto" }}
          />
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
                  src="/img/logo-blue.svg"
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
              <li className="nav-item   dropdown ">
                <Link
                  className={clsx(
                    "nav-link dropdown-toggle js-dropdown-toggle",
                    activeMobileMenu === 0 && "visible"
                  )}
                  href="#"
                  onClick={(e) => handleActiveMobileMenu(e, 0)}
                >
                  <span>Navigation</span>
                  <img src="/img/icon-dropdown.svg" alt="" />
                </Link>
                <div
                  className={clsx(
                    "dropdown-menu",
                    activeMobileMenu === 0 ? "!block" : "!hidden"
                  )}
                >
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
                </div>
              </li>
              {/*<li className="nav-item   dropdown ">*/}
              {/*  <a className="nav-link dropdown-toggle js-dropdown-toggle visible" href="#">*/}
              {/*    <span>Tools</span>*/}
              {/*    <img src="/img/icon-dropdown.svg" alt="" />*/}
              {/*  </a>*/}
              {/*  <div className="dropdown-menu" style="display: none;">*/}
              {/*    <Link className="dropdown-item " href="/instruments/ico">ICO</Link>*/}
              {/*    <Link className="dropdown-item " href="/instruments/airdrop">Airdrop</Link>*/}
              {/*    <Link className="dropdown-item " href="/instruments/farming">Farming</Link>*/}
              {/*    <Link className="dropdown-item " href="/instruments/crypto">Cryptocurrencies</Link>*/}
              {/*    <Link className="dropdown-item " href="/instruments/mayning">Mining</Link>*/}
              {/*    <Link className="dropdown-item " href="/instruments/steyking">Staking</Link>*/}
              {/*  </div>*/}
              {/*</li>*/}
              {/*<li className="nav-item   dropdown ">*/}
              {/*  <a className="nav-link dropdown-toggle js-dropdown-toggle visible" href="#">*/}
              {/*    <span>Useful information</span>*/}
              {/*    <img src="/img/icon-dropdown.svg" alt="" />*/}
              {/*  </a>*/}
              {/*  <div className="dropdown-menu" style="display: block;">*/}
              {/*    <Link className="dropdown-item " href="/articles">Articles</Link>*/}
              {/*    <Link className="dropdown-item " href="/pages/vakansii">Careers</Link>*/}
              {/*    <Link className="dropdown-item " href="/interpretations">Investor glossary</Link>*/}
              {/*    <Link className="dropdown-item " href="/portfolio">Investment portfolios</Link>*/}
              {/*    <Link className="dropdown-item " href="/apps">Exchange apps</Link>*/}
              {/*    <Link className="dropdown-item " href="/trades">How to trade on a crypto exchange?</Link>*/}
              {/*  </div>*/}
              {/*</li>*/}
            </ul>

            {/*<Link className="mobile-gift-img" href="/bonuses">*/}
            {/*  <span className="text">Get gift</span>*/}
            {/*  <span className="icon-gift"></span>*/}
            {/*</Link>*/}
          </div>
        </div>
        <div className="header-icons">
          {/*<Link className="header-gift-img" href="/bonuses"></Link>*/}

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
