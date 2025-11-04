import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import { Helmet } from 'react-helmet';
import { getFetchClient, LinkButton, useFetchClient, useNotification, useQueryParams } from "@strapi/helper-plugin";
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import Layout from "../../components/Layout";
import Section from "../../components/Section";
import { Grid, GridItem } from "@strapi/design-system";
import pluginId from "../../pluginId";
import PaginationFooter from "../../components/PaginationFooter";
import getRequestUrl from "../../utils/get-request-url";

const HomePage = () => {
  const notify = useNotification();

  const fetchClient = useFetchClient();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [urls, setUrls] = useState({
    models: [],
    page: 1,
    pageSize: 100,
    total: 0,
    results: []
  });
  const [{ query }, setQuery] = useQueryParams();

  const pageSize = get(query, 'pageSize');
  const page = +(get(query, 'page', 1));

  useEffect(() => {
    if (!query.pageSize) {
      setQuery({ ...page, pageSize: 100 });
    }
  }, [query]);

  const fetchSitemapSetting = async () => {
    setIsLoading(true);
    try {
      const { get } = getFetchClient();
      const response = await get(getRequestUrl('sitemap-setting'));
      if (response.data.api_key) {
        setApiKey(response.data.api_key);
      } else {
        notify({ type: 'warning', message: 'API key is not set. Please go to setting page to set it.' });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSitemaps = async () => {
    setIsLoading(true);
    try {
      const { get } = getFetchClient();
      const response = await get(getRequestUrl('sitemap', { page, pageSize }));
      setUrls(response.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSitemapSetting();
  }, []);

  useEffect(() => {
    if (pageSize) {
      fetchSitemaps();
    }
  }, [pageSize, page]);

  return (
    <>
      <Helmet>
        <title>Sitemap</title>
        <meta name="description" content="Siteamp" />
        <link rel="canonical" href={`${strapi.backendURL}/plguins/sitemap`} />
      </Helmet>
      <Layout isLoading={isLoading} title="Sitemap">
        <HeaderLayout
          title="Sitemap"
          primaryAction={
            <LinkButton to={`/plugins/${pluginId}/settings`}>
              Configuration
            </LinkButton>
          }
        />
        <ContentLayout>
          <Box>
            <Section>
              <Grid gap={8}>
                {urls.results.map((url) => (
                  <GridItem key={url} col={4} s={6} xs={12} style={{ display: "flex", alignItems: "center" }}>
                    <span>
                      ● <a href={url} rel="noreferrer" target="_blank">{url}</a>
                    </span>
                  </GridItem>
                ))}
              </Grid>
            </Section>
          </Box>
          <Box paddingBottom={10}>
            <PaginationFooter
              pagination={{
                page: urls.page,
                pageCount: Math.ceil(urls.total / urls.pageSize),
                pageSize: urls.pageSize,
                total: urls.total
              }}
            />
          </Box>
        </ContentLayout>
      </Layout>
    </>
  );
};

export default HomePage;
