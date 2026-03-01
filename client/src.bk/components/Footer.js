import Image from "next/image";
import Link from "next/link";

const Footer = ({ menu, copyrightMenu }) => {
  return (
    <div className="footer-wrapper">
      <div className="footer-inner">
        <div className="footer-menus">
          <div className="footer-main-menus">
            <div className="left-side">
              <Link href="/">
                <Image
                  className="logo-blue"
                  src="/img/logo.svg"
                  alt="Coin Explorers"
                  width={190}
                  height={80}
                  style={{ height: "60px", width: "auto" }}
                />
              </Link>
              {/* <div className="text-30 laptop-desktoph2-sb-30">
                Be the first <br />
                to know about events
              </div> */}
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
              © Cryptoteh.Ru {new Date().getFullYear()}
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
        <p className="copyright-text">
          Materials published on this site are for informational purposes only and
          do not constitute individual investment advice. The site administration
          is not responsible for user decisions and reminds of possible risks
          associated with partial or total loss of funds. The site is for
          information only, does not accept payments and is intended for audiences 18+.
        </p>
      </div>
    </div>
  );
};

export default Footer;
