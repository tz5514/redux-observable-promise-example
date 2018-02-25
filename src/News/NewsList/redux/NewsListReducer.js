import createAjaxReducer from '/generic/modules/createAjaxReducer'
import { fetchNewsList } from 'News/NewsList/redux/NewsListActions'

export default createAjaxReducer(fetchNewsList.request, fetchNewsList.success, fetchNewsList.error)