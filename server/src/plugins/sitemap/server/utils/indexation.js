'use strict';

const serviceURL = 'https://api.speedyindex.com/v2';

/**
 * @param {'google' | 'yandex'} searchEngine
 * @param {'indexer' | 'checker'} taskType
 **/
const reportTaskURL = (searchEngine, taskType) => {
  return`${serviceURL}/task/${searchEngine}/${taskType}/report`;
};

/**
 * @param {'google' | 'yandex'} searchEngine
 * @param {'indexer' | 'checker'} taskType
 **/
const createTaskURL = (searchEngine, taskType) => {
  return`${serviceURL}/task/${searchEngine}/${taskType}/create`;
};

module.exports = {
  reportTaskURL,
  createTaskURL,
};
