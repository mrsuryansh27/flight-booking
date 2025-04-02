const Footer2 = ({ bg, extraClass }) => {
    return (
      <footer
        className={`main-footer ${bg ? bg : "black"}-bg ${
          extraClass ? extraClass : ""
        }`}
      >
        <div className="container">
          {/*=== Footer CTA ===*/}
          
          {/*=== Footer Widget ===*/}
         
          {/*=== Footer Copyright ===*/}
          <div className="footer-copyright fixed bottom-0 top-0">
            <div className="row">
              <div className="col-lg-6">
                {/*=== Footer Text ===*/}
                <div className="footer-text">
                  <p>
                    Copy@ 2023 <span style={{ color: "#F7921E" }}>GoWilds</span>,
                    All Right Reserved
                  </p>
                </div>
              </div>
              <div className="col-lg-6">
                {/*=== Footer Nav ===*/}
                <div className="footer-nav float-lg-end">
                  <ul>
                    <li>
                      <a href="#">Setting &amp; privacy</a>
                    </li>
                    <li>
                      <a href="#">Faqs</a>
                    </li>
                    <li>
                      <a href="#">Support</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  export default Footer2;
  