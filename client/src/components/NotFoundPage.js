import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="content-inside pages-show">
      <div className="article-show">
        <div className="article-show__content">
          <div className="error-page">
            <h1>404</h1>
            <div className="sub-title">
              Не удалось загрузить страницу
            </div>
            <div className="description">
              По вашему запросу ничего не нашлось, но все, что нужно, есть на главной странице
            </div>
            <div className="url">
              <Link href="/">Перейти на главную страницу</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
