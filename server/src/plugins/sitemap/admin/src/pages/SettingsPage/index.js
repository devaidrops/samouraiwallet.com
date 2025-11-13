import React, { useEffect, useRef, useState } from 'react';
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import { Grid, GridItem, Link, TextInput } from "@strapi/design-system";
import { getFetchClient, useNotification } from "@strapi/helper-plugin";
import { ArrowLeft } from "@strapi/icons";
import Layout from "../../components/Layout";
import PrimaryAction from "../../components/PrimaryAction";
import Section from "../../components/Section";
import pluginId from "../../pluginId";

const SettingsPage = () => {
  const notify = useNotification();

  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [apiKeyError, setApiKeyError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const apiKeyRef = useRef(null);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const { get } = getFetchClient();
      const requestUrl = strapi.backendURL + '/content-type-builder/content-types';
      const response = await get(requestUrl);
      setModels((response.data?.data || []).filter((model) => model.uid.startsWith("api::") && model.schema.kind === "collectionType" && model.schema.visible));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(true);
      notify({
        type: 'warning',
        message: 'Could not fetch model names.',
      });
    }
  };

  const fetchSitemapSetting = async () => {
    setIsLoading(true);
    try {
      const { get } = getFetchClient();
      const requestUrl = strapi.backendURL + '/sitemap/sitemap-setting';
      const response = await get(requestUrl);
      setApiKey(response.data.api_key);
      setSelectedModels((response.data.models || '').split(','));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickSave = async () => {
    if (apiKey) {
      try {
        const { put } = getFetchClient();
        const requestUrl = strapi.backendURL + '/sitemap/sitemap-setting';
        await put(requestUrl, { data: { api_key: apiKey, models: selectedModels.join(",") } });
        notify({ type: 'success', message: "Setting is saved successfully" });
      } catch (error) {
        notify({ type: 'warning', message: error });
      } finally {
        setIsLoading(false);
      }
    } else {
      setApiKeyError("Please input API key");
      notify({ type: "warning", message: "Please input API key" });
    }
  };

  const handleChangeModels = async (updatedModels) => {
    setSelectedModels(updatedModels);
  };

  useEffect(() => {
    fetchModels();
    fetchSitemapSetting();
  }, []);

  return (
    <Layout isLoading={isLoading} title="Sitemap Setting">
      <HeaderLayout
        title="Sitemap Setting"
        // navigationAction={
        //   <Link startIcon={<ArrowLeft />} to={`/plugins/${pluginId}`}>
        //     Go back
        //   </Link>
        // }
        primaryAction={
          <PrimaryAction onClick={handleClickSave}>
            Save
          </PrimaryAction>
        }
      />
      <ContentLayout>
        <Box paddingBottom={10}>
          <Section>
            <Grid gap={2}>
              <GridItem col={6} s={12}>
                <TextInput
                  ref={apiKeyRef}
                  error={apiKeyError}
                  value={apiKey}
                  label="Speedyindex Service API Key"
                  placeholder="API key of speedyindex api service"
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </GridItem>

              {/*<GridItem col={6} s={12}>
                <MultiSelect
                  withTags
                  label="Select models to be included in sitemap"
                  value={selectedModels}
                  onClear={() => setSelectedModels(undefined)}
                  onChange={handleChangeModels}
                >
                  {models.map(model => (
                    <MultiSelectOption  key={model.uid} value={model.uid}>{model.schema.displayName}</MultiSelectOption>
                  ))}
                </MultiSelect>
              </GridItem>*/}
            </Grid>
          </Section>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default SettingsPage;
