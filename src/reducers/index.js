
import {combineReducers} from 'redux';

const concepts = (state = [], action) => {
    console.log('concepts\naction:', action, ', \nstate:', state);
    switch (action.type) {
        case 'ADD_CONCEPT':
            return state;
        default:
            return state;
    }
}

const groupNames = (state = '', action) => {
    switch (action.type) {
        case 'CHANGE_NAME':
            return state;
        default:
            return state;
    }
}

const info = (state = '', action) => {
    switch (action.type) {
        case 'CHANGE_NAME':
            return state;
        default:
            return state;
    }
}

const scenarios = (state = [], action) => {
    switch (action.type) {
        case 'ADD_SCENARIO':
            return state;
        default:
            return state;
    }
}

const allReducers = combineReducers({
    concepts,
    groupNames,
    info,
    scenarios
});

export default allReducers