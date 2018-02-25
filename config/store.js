import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createEpicEnhancer } from 'generic/modules/redux-observable-promise'
import ajax from 'universal-rx-request'

import rootReducer from 'config/rootReducer'
import rootEpic from 'config/rootEpic'

const isServer = typeof window === 'undefined';

export default function initStore(initialState) {
  const epicEnhancer = createEpicEnhancer(rootEpic, {
    dependencies: { ajax }
  });

  let middlewares = [thunkMiddleware];
  if (!isServer) {
    middlewares.push(createLogger({ collapsed: true }));
  }
  const reduxMiddleware = applyMiddleware(...middlewares);
  return createStore(rootReducer, initialState, composeWithDevTools(epicEnhancer, reduxMiddleware));
};