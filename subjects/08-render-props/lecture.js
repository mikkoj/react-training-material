import React from 'react'
import { render } from 'react-dom'
import * as styles from './utils/styles'
import searchGitHubRepos from './utils/searchGitHubRepos'
import ScrollBottomNotifier from './utils/ScrollBottomNotifier'

////////////////////////////////////////////////////////////////////////////////
// Here's a fun app, check out ScrollBottomNotifier, making these kinds of tasks
// declarative is fantastic and makes code reuse really straightforward.

const DefaultFetchURL = 'https://api.github.com/search/repositories?q=react&sort=stars'

//const App = React.createClass({
//  getInitialState() {
//    return {
//      fetching: false,
//      repos: [],
//      links: {}
//    }
//  },
//
//  fetch(url=DefaultFetchURL) {
//    this.setState({ fetching: true })
//
//    searchGitHubRepos(url, (err, repos, links) => {
//      this.setState({
//        fetching: false,
//        repos: this.state.repos.concat(repos),
//        links
//      })
//    })
//  },
//
//  componentDidMount() {
//    this.fetch()
//  },
//
//  fetchNextPage() {
//    this.fetch(this.state.links.next)
//  },
//
//  render() {
//    const canFetch = !this.state.fetching && this.state.links.next
//
//    return (
//      <ScrollBottomNotifier
//        style={styles.repos}
//        onScrollBottom={canFetch ? this.fetchNextPage : null}
//      >
//        <ul style={styles.repoList}>
//          {this.state.repos.map(repo => (
//            <li key={repo.id}>
//              <a href={repo.html_url} style={styles.repo}>
//                <h3>{repo.full_name}</h3>
//                <p>{repo.description}</p>
//              </a>
//            </li>
//          ))}
//        </ul>
//      </ScrollBottomNotifier>
//    )
//  }
//})
//
//render(<App/>, document.getElementById('app'))

////////////////////////////////////////////////////////////////////////////////
// Making something like Scrolling a component makes a lot of sense, but what
// of all that github search stuff? Could we make that declarative?
//
// First we'll just create a new component and move a bunch of stuff from
// <App> to <GitHubSearch>.

//const { string } = React.PropTypes
//
//const GitHubSearch = React.createClass({
//  propTypes: {
//    url: string.isRequired
//  },
//
//  getDefaultProps() {
//    return {
//      url: DefaultFetchURL
//    }
//  },
//
//  getInitialState() {
//    return {
//      fetching: false,
//      repos: [],
//      links: {}
//    }
//  },
//
//  fetch(url) {
//    this.setState({ fetching: true })
//
//    searchGitHubRepos(this.props.url, (err, repos, links) => {
//      this.setState({
//        fetching: false,
//        repos: this.state.repos.concat(repos),
//        links
//      })
//    })
//  },
//
//  componentDidMount() {
//    this.fetch()
//  },
//
//  fetchNextPage() {
//    this.fetch(this.state.links.next)
//  },
//
//  render() {
//    return <pre>{JSON.stringify(this.state, null, 2)}</pre>
//  }
//})
//
//const App = React.createClass({
//  render() {
//    return (
//      <GitHubSearch />
//    )
//  }
//})
//
//render(<App />, document.getElementById('app'))

////////////////////////////////////////////////////////////////////////////////
// So now we've got the thing kinda working, but not rendering anything useful.
// How do we get data from inside of <GitHubSearch>, back out to <App>?
//
// Well, how do we ever get data from inside a component to another? We send a
// callback, turns out we can use that same technique for rendering too!

const { string } = React.PropTypes

const GitHubSearch = React.createClass({
  propTypes: {
    url: string.isRequired
  },

  getDefaultProps() {
    return {
      url: DefaultFetchURL
    }
  },

  getInitialState() {
    return {
      fetching: false,
      repos: [],
      links: {}
    }
  },

  fetch(url) {
    this.setState({ fetching: true })

    searchGitHubRepos(this.props.url, (err, repos, links) => {
      this.setState({
        fetching: false,
        repos: this.state.repos.concat(repos),
        links
      })
    })
  },

  componentDidMount() {
    this.fetch()
  },

  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url)
      this.fetch(this.props.url)
  },

  render() {
    return this.props.children(this.state)
  }
})

const App = React.createClass({
  getInitialState() {
    return {
      url: DefaultFetchURL
    }
  },

  fetchNextPage(searchState) {
    if (!searchState.fetching && searchState.links.next)
      this.setState({ url: searchState.links.next })
  },

  render() {
    return (
      <div>
        <GitHubSearch url={this.state.url}>
          {(searchState) => (
            <ScrollBottomNotifier
              style={styles.repos}
              onScrollBottom={() => this.fetchNextPage(searchState)}
            >
              <ul style={styles.repoList}>
                {searchState.repos.map(repo => (
                  <li key={repo.id}>
                    <a href={repo.html_url} style={styles.repo}>
                      <h3>{repo.full_name}</h3>
                      <p>{repo.description}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollBottomNotifier>
          )}
        </GitHubSearch>
      </div>
    )
  }
})

render(<App />, document.getElementById('app'))
