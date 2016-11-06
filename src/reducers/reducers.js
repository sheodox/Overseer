import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import echoReducers from './echo-reducers';
import lightsReducers from './lights-reducers';
import appReducers from './app-reducers';

let args = [
    combineReducers({
        ...lightsReducers,
        ...echoReducers,
        ...appReducers
    })];

try {
    args.push(window.__PRELOADED_STATE__);
}catch(e) {}

args.push(applyMiddleware(thunk));

export default createStore(...args);