import { createAction } from 'redux-act'

export default function createAjaxActions(description = 'ajax') {
  const requestAction = createAction(`${description}.request`);
  const successAction = createAction(`${description}.success`);
  const errorAction = createAction(`${description}.error`);
  

  requestAction.request = requestAction;
  requestAction.success = successAction;
  requestAction.error = errorAction.asError;
  Object.assign(requestAction.error, errorAction);
  return requestAction;
}