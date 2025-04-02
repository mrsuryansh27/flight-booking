import Link from "next/link";
import Menu from "../Menu";
const Header1 = () => {
  return (
    <header className="header-area header-one pt-20 pb-20 mb-12">
      {/*====== Header Navigation ======*/}
      <div className="header-navigation">
        <div className="nav-overlay" />
        <div className="container-fluid ">
          <div className="primary-menu">
            {/*====== Site Branding ======*/}
            <div className="site-branding">
              <Link legacyBehavior href="/">
                <a className="brand-logo">
                  <img
                    src="assets/images/logo/logo-black.png"
                    alt="Site Logo"
                  />
                </a>
              </Link>
            </div>
            {/*====== Nav Menu ======*/}
           
            {/*====== Nav Right Item ======*/}
            <div className="nav-right-item">
              <div className="menu-button d-xl-block d-none">
                <Link legacyBehavior href="tel:+919354249191">
                  <a className="main-btn primary-btn">
                    Call Now
                    <i className="fas fa-phone" />
                  </a>
                </Link>
              </div>
              <div className="navbar-toggler">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header1;
