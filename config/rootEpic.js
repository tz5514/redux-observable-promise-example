import 'rxjs'
import { combineEpics } from 'redux-observable'
import * as NewsListEpics from 'News/NewsList/redux/NewsListEpics'

const epicList = [
  NewsListEpics,
]

export default combineEpics(
  ..._.flatten(epicList.map(epics => Object.values(epics))),
);