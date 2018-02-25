import createAjaxActions from '/generic/modules/createAjaxActions'
import { promisifyEpic } from 'generic/modules/redux-observable-promise'

export const fetchNewsList = createAjaxActions('fetchNewsList');

export const fetchNewsListAsync = promisifyEpic(
  fetchNewsList.request, 
  fetchNewsList.success.getType(),
  fetchNewsList.error.getType()
);