import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { compose, applyMiddleware } from 'redux'
import { combineEpics, createEpicMiddleware as originalCreateEpicMiddleware } from 'redux-observable'

const RESOLVE = 'RESOLVE';
const REJECT = 'REJECT';

// epic
const listenerCollectionEpic = (actions$, store, { listenerEpicObservable$ }) => {
  return listenerEpicObservable$.mergeMap(epic => epic(actions$, store));
}

// -- enhancer --

// 主要的 enhancer
export const createEpicEnhancer = (rootEpic, options) => (createStore) => {
  const listenerEpicObservable$ = new BehaviorSubject(combineEpics());

  const promisifyEpicEnhancer = createpromisifyEpicEnhancer(listenerEpicObservable$);
  const epicMiddleware = createEpicMiddleware(combineEpics(rootEpic, listenerCollectionEpic), options, listenerEpicObservable$);
  const middleware = applyMiddleware(epicMiddleware);
  return compose(promisifyEpicEnhancer, middleware)(createStore);
}

// 在 dispatch 中攔截 epic async action 並產生 promise 的 enhancer
const createpromisifyEpicEnhancer = (listenerEpicObservable$) => (createStore) => (...params) => {
  const store = createStore(...params);
  const dispatch = store.dispatch;
  store.dispatch = (action) => {
    const { isPromisifyEpic, startingAction, listener } = action;

    if (!isPromisifyEpic || !startingAction || !listener) {
      return dispatch(action);
    }

    const epicAsyncStatusObservable$ = new Observable(rxObserver => {
      listenerEpicObservable$.next(createListenerEpic(listener, rxObserver))
    });

    let pendingResolveTypes = listener.resolve;
    let resolveResults = {};
    return new Promise((resolve, reject) => {
      dispatch(startingAction);
      const rxSubscriber = epicAsyncStatusObservable$.subscribe(({ status, action }) => {
        if (status === RESOLVE) {
          pendingResolveTypes = pendingResolveTypes.filter(type => type != action.type);
          resolveResults[action.type] = action;
          if (pendingResolveTypes.length == 0) {
            resolve(resolveResults);
            rxSubscriber.unsubscribe();
          }
        } else if (status === REJECT) {
          reject(action);
          rxSubscriber.unsubscribe();
        }
      });
    });
  } 
  return store;
}

// 注入 dispatchAsyncEpic 方法的 enhancer
// function injectDispatchAsyncEpicEnahncer(createStore) {
//   return (...params) => {
//     const store = createStore(...params);
//     store.dispatchAsyncEpic = (...actionParams) => {
//       return store.dispatch(promisifyEpic(...actionParams))
//     };
//     return store;
//   }
// }

// -- middleware --

// 建立 epicMiddleware 並注入 listenerEpicObservable$ 到 dependencies
function createEpicMiddleware(rootEpic, options = {}, listenerEpicObservable$) {
  const injectedDependencies = {
    isServer: typeof window === 'undefined',
    listenerEpicObservable$
  };

  options.dependencies = (options.dependencies) ? 
    { ...options.dependencies, ...injectedDependencies } : 
    injectedDependencies;
  return originalCreateEpicMiddleware(rootEpic, options);
}

// 建立 epic async action 狀態的監聽用 epic
const createListenerEpic = (listener, rxObserver) => (action$) => {
  return action$.ofType(...listener.resolve)
    .do(action => rxObserver.next({ status: RESOLVE, action }))
    .race(action$.ofType(...listener.reject)
      .do(action => rxObserver.next({ status: REJECT, action }))
    ).ignoreElements()
}

// 產生 epic async action 的 helper 方法
export function promisifyEpic(startingAction, resolvingListener = [], rejectingListener = []) {
  if (resolvingListener.length == 0) {
    throw new Error('The second parameter "resolvingListener" must be an action type or an array of action types.');
  }

  const listener = {
    resolve: Array.isArray(resolvingListener) ? resolvingListener : [resolvingListener].filter(t => t),
    reject: Array.isArray(rejectingListener) ? rejectingListener : [rejectingListener].filter(t => t)
  };
  
  if (typeof startingAction === 'function') {
    // option is an action creator
    return (...params) => ({ isPromisifyEpic: true, startingAction: startingAction(...params), listener }); 
  } else { 
    // option is an action
    return { isPromisifyEpic: true, startingAction, listener };
  }
}