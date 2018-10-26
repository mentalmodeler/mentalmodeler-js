
import {combineReducers} from 'redux';

const concepts = (state = {collection:[], selectedConcept: null, selectedRelationship:null}, action) => {
    // console.log('concepts\naction:', action, ', \nstate:', state);
    const {collection, selectedConcept, selectedRelationship} = state;
    let newCollection = [];
    switch (action.type) {
        case 'CONCEPT_MOVE':
            newCollection = collection.map((concept) => {
                return (concept.id === action.id)
                    ? {...concept, x: action.x, y: action.y}
                    : concept
                ;
            });
            return {...state, collection: newCollection};
        case 'CONCEPT_FOCUS':
            // newCollection = collection.map((concept) => {
            //     return (concept.id === action.id)
            //         ? {...concept, focused: true}
            //         : {...concept, focused: false}
            //     ;
            // });
            // return {...state, collection: newCollection};
            return {...state, selectedConcept: action.id, selectedRelationship: null};
        case 'CONCEPT_CHANGE':
            newCollection =  collection.map((concept) => {
                if (concept.id === action.id) {
                    const c = {...concept, name: action.name, width: action.width, height: action.height};
                    // console.log(concept.id, '\nconcept:', c, '\n');
                    return c;
                }
                return concept;
            });
            return {...state, collection: newCollection};
        default:
            return state;
    }
}

const groupNames = (state = '', action) => {
    // console.log('concepts\naction:', action, ', \nstate:', state);
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