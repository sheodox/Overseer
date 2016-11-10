import {combineReducers, createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import echoReducers from './echo-reducers';
import lightsReducers from './lights-reducers';
import appReducers from './app-reducers';
import voterReducers from './voter-reducers';
import settingsReducers from './settings-reducers';

let composeEnhancers = compose,
    args = [
    combineReducers({
        ...lightsReducers,
        ...echoReducers,
        ...appReducers,
        ...voterReducers,
        ...settingsReducers
    })];

try {
    args.push(window.__PRELOADED_STATE__);
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}catch(e){}

args.push(composeEnhancers(applyMiddleware(thunk)));

export default createStore(...args);