'use strict';

const cron = require('node-cron');
const fs = require("fs");
const path = require("path");
const { UID_SITEMAP_SETTING } = require("../constants");
const { createTaskURL, reportTaskURL } = require("../utils/indexation");

module.exports = {
  async scheduleIndexation() {
    cron.schedule('0 0 * * *', async () => {
      try {
        // Logic to execute (this runs every day)
        console.log('----- Schedule indexation -----');
        while (!(await this.updateIndexationStatus())) {
        }
      } catch (error) {
        console.error('Error in Schedule indexation:', error);
      }
    });
  },
  async scheduleIndexationFile() {
    cron.schedule('0 */2 * * *', async () => {
      try {
        // Logic to execute (this runs every 2 hours)
        console.log('----- Update Indexation File -----');
        this.updateIndexationFile();
      } catch (error) {
        console.error('Error in Update Indexation File:', error);
      }
    });
  },


  async updateIndexationFile() {
    if (typeof strapi === "undefined") return 0;

    const links = await this.getLinks();
    const linksRecords = links.reduce((prev, link) => ({
      [link.link]: {
        ...link,
        google: undefined,
        yandex: undefined
      }, ...prev
    }), {});

    const setting = await strapi.query(UID_SITEMAP_SETTING).findOne();
    if (!setting) return;

    if (setting.google_task_id) {
      const response = await this.reportTask('google', setting.api_key, setting.google_task_id);
      if (response?.result) {
        (response.result?.indexed_links || []).forEach((link) => {
          if (linksRecords[link]) linksRecords[link].google = true;
          else linksRecords[link] = { link, google: true, yandex: undefined };
        });
        (response.result?.unindexed_links || []).forEach((link) => {
          if (linksRecords[link]) linksRecords[link].google = false;
          else linksRecords[link] = { link, google: false, yandex: undefined };
        });
      }
    } else {
      const googleTaskId = this.createTask('google', setting.api_key, links.map(({ link }) => link));
      if (googleTaskId) {
        const googleTaskIds = googleTaskId
          ? `${setting?.google_task_ids ? `${setting?.google_task_ids},` : ""}${googleTaskId}`
          : setting?.google_task_ids;
        await strapi.query(UID_SITEMAP_SETTING).update({
          where: { id: setting.id },
          data: { google_task_id: googleTaskId, google_task_ids: googleTaskIds }
        });
      }
    }

    if (setting.yandex_task_id) {
      const response = await this.reportTask('yandex', setting.api_key, setting.yandex_task_id);
      if (response?.result) {
        (response.result.indexed_links || []).forEach((link) => {
          if (linksRecords[link]) linksRecords[link].yandex = true;
          else linksRecords[link] = { link, google: undefined, yandex: true };
        });
        (response.result.unindexed_links || []).forEach((link) => {
          if (linksRecords[link]) linksRecords[link].yandex = false;
          else linksRecords[link] = { link, google: undefined, yandex: false };
        });
      }
    } else {
      const yandexTaskId = this.createTask('yandex', setting.api_key, links.map(({ link }) => link));
      if (yandexTaskId) {
        const yandexTaskIds = yandexTaskId
          ? `${setting?.yandex_task_ids ? `${setting?.yandex_task_ids},` : ""}${yandexTaskId}`
          : setting?.yandex_task_ids;
        await strapi.query(UID_SITEMAP_SETTING).update({
          where: { id: setting.id },
          data: { yandex_task_id: yandexTaskId, yandex_task_ids: yandexTaskIds }
        });
      }
    }
    const records = Object.values(linksRecords).sort((record1, record2) => {
      const sum1 = (record1.google ? 3 : 1) * (record1.yandex ? 2 : 1);
      const sum2 = (record2.google ? 3 : 1) * (record2.yandex ? 2 : 1);
      return sum2 - sum1;
    });


    const fullPath = path.join(__dirname, 'sitemap.json');
    fs.writeFileSync(fullPath, JSON.stringify(records));
  },

  async updateIndexationStatus() {
    if (typeof strapi === "undefined") return 0;

    const setting = await strapi.query(UID_SITEMAP_SETTING).findOne();

    const links = await this.getLinks();

    const [googleTaskId, yandexTaskId] = await Promise.all([
      this.createTask('google', setting.api_key, links.map(({ link }) => link)),
      this.createTask('yandex', setting.api_key, links.map(({ link }) => link))
    ]);

    await strapi.query(UID_SITEMAP_SETTING).update({
      where: { id: setting.id },
      data: {
        google_task_id: googleTaskId,
        google_task_ids: googleTaskId ? `${setting?.google_task_ids
          ? `${setting?.google_task_ids},`
          : ""}${googleTaskId}` : setting?.google_task_ids,
        yandex_task_id: yandexTaskId,
        yandex_task_ids: yandexTaskId ? `${setting?.yandex_task_ids
          ? `${setting?.yandex_task_ids},`
          : ""}${yandexTaskId}` : setting?.yandex_task_ids,
      }
    });

    return 1;
  },

  async getLinks() {
    const baseUrl = process.env.PUBLIC_CLIENT_URL || 'https://cryptoteh.ru';
  
    const reviews = await strapi.query('api::review.review').findMany({ populate: ['review_category'] });
    const posts = await strapi.query('api::post.post').findMany({ populate: ['post_category'] });
  
    return [
      ...reviews.map((review) => ({
        link: `${baseUrl}/${review.review_category?.slug || ''}/${review.slug}`,
        label: review.title
      })),
      ...posts.map((post) => ({
        link: `${baseUrl}/${post.post_category?.slug || ''}/${post.slug}`,
        label: post.title
      })),
    ];
  },
  
  /**
   * @param {'google' | 'yandex'} taskType
   * @param {string} apiKey
   * @param {string[]} links
   * @return Promise<string>
   **/
  async createTask(taskType, apiKey, links) {
    return await strapi.fetch(createTaskURL(taskType, 'checker'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify({ urls: links }),
    }).then(async (response) => {
      const result = await response.json();
      return result.task_id;
    }).catch(() => "");
  },

  /**
   * @param {'google' | 'yandex'} taskType
   * @param {string} apiKey
   * @param {string} taskId
   * @return Promise<object>
   **/
  async reportTask(taskType, apiKey, taskId) {
    return await strapi.fetch(reportTaskURL(taskType, 'checker'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify({ task_id: taskId }),
    })
      .then(async (response) => await response.json())
      .catch(() => undefined);
  },

  async getList(page, pageSize) {
    const fullPath = path.join(__dirname, 'sitemap.json');
    if (!fs.existsSync(fullPath)) {
      await this.updateIndexationFile();
    }
    const listString = fs.readFileSync(fullPath, { encoding: 'utf8' });
    try {
      const list = JSON.parse(listString);
      return {
        count: list.length,
        list: list.slice((page - 1) * pageSize, page * pageSize).map((item) => ({ link: item.link, label: item.label }))
      };
    } catch (e) {
      console.error(e);
      return { count: 0, list: [] };
    }
  }
};
