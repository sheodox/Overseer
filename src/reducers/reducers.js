import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import echoReducers from './echo-reducers';
import lightsReducers from './lights-reducers';

export default createStore(combineReducers({
    ...lightsReducers,
    ...echoReducers
}), applyMiddleware(thunk))