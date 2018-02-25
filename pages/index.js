import withRedux from 'next-redux-wrapper'
import initStore from '../config/store'
import { fetchNewsList, fetchNewsListAsync } from 'News/NewsList/redux/NewsListActions'

class IndexPage extends React.PureComponent {
  static async getInitialProps({ store }) {
    try {
      // const result = await store.dispatch(fetchNewsListAsync());
    } catch (error) {
      console.log(error);
    }
  }

  test = async() => {
    try {
      await this.props.fetchNewsList();
      console.log('done');
    } catch (error) {
      console.log(error);
    }
    
  }

  render() {
    return (
      <div>
        <button onClick={this.test}>start</button>
        {this.props.news.map(item => (
        <div key={item.id}>{item.title}</div>
        ))}
      </div>
    )
  }
}

export default withRedux(
  initStore, 
  (state) => ({ news: state.news.data }), 
  { fetchNewsList }
)(IndexPage)