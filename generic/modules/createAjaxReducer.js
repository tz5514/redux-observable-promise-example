import { createAction, createReducer } from 'redux-act'
import update from 'immutability-helper'

const initialState = {
  status: null,
  error: null,
  data: []
};

const requestRuducer = (state) => update(state, { 
  $merge: {
    status: 'request',
    error: null
  }
});

const successReducer = (state, payload) => update(state, {
  $merge: {
    status: 'success',
    data: payload,
    error: null
  }
});

const errorReducer = (state, payload) => update(state, {
  $merge: {
    status: 'error',
    error: payload
  }
})

export default function createAjaxReducer(requestType, successType, errorType) {
  return createReducer({
    [requestType]: requestRuducer,
    [successType]: successReducer,
    [errorType]: errorReducer
  }, initialState);
}