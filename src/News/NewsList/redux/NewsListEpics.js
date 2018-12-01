import { Observable } from 'rxjs'
import { fetchNewsList } from 'News/NewsList/redux/NewsListActions'

export const fetchNewsListEpic = (action$, store, { ajax }) => {
  return action$
    .ofType(fetchNewsList.request.getType())
    .mergeMap(() =>
      ajax({ url: 'https://jsonplaceholder.typicode.com/posts' })
      .mergeMap(response => Observable.of(
        fetchNewsList.success(response.body),
      ))
      .catch(error => Observable.of(
        fetchNewsList.error(error.error.toString())
      ))
    );
}
