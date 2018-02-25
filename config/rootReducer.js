import { combineReducers } from 'redux'
import NewsListReducer from 'News/NewsList/redux/NewsListReducer'

export default combineReducers({
  news: NewsListReducer
});

