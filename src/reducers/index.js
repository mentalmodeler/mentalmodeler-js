
import {combineReducers} from 'redux';

const concepts = (state = [], action) => {
    // console.log('concepts\naction:', action, ', \nstate:', state);
    switch (action.type) {
        case 'CONCEPT_MOVE':
            return state.map((concept) => {
                return (concept.id === action.id)
                    ? {...concept, x: action.x, y: action.y}
                    : concept
                ;
            });
        case 'CONCEPT_FOCUS':
            return state.map((concept) => {
                if (concept.id === action.id) {
                    // console.log('concept.id:', concept.id);
                }
                return (concept.id === action.id)
                    ? {...concept, focused: true}
                    : {...concept, focused: false}
                ;
            });
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