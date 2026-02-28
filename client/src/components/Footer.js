import Image from "next/image";
import Link from "next/link";

const Footer = ({ menu, copyrightMenu, generalOption }) => {
  return (
    <div className="footer-wrapper">
      <div className="footer-inner">
        <div className="footer-menus">
          <div className="footer-main-menus">
            <div className="left-side">
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
            </div>

            <div className="right-side">
              {menu.items.data.map((item) => (
                <div key={item.id} className="frame-wrapper">
                  <div className="text-7 laptop-desktoptext-m-15-med">
                    {item.attributes.title}
                  </div>
                  <div className="frame-60 laptop-desktoptext-m-15-reg">
                    {item.attributes.children.data.map((link) => (
                      <div key={link.id} className="menu_item ">
                        <Link className="text-url" href={link.attributes.url}>
                          {link.attributes.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="menu-copyright laptop-desktoptext-m-15-reg">
            <div className="copyright">
            Copyright © {new Date().getFullYear()} - All Rights Reserved
            </div>

            {copyrightMenu.items.data.map((item) => (
              <div key={item.id} className="menu_copyright_item ">
                <a href={item.attributes.url} className="text-url">
                  {item.attributes.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
