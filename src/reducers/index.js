
import {combineReducers} from 'redux';

const updateCollection = function (collection, id, updatedProps = {}) {
    return collection.map((concept) => (concept.id === id ? {...concept, ...updatedProps} : concept));
};

const concepts = (state = {collection:[], selectedConcept: null, selectedRelationship:null}, action) => {
    // console.log('concepts\naction:', action, ', \nstate:', state);
    const {collection, selectedConcept, selectedRelationship} = state;
    let newCollection = [];
    switch (action.type) {
        case 'CONCEPT_MOVE':
            return {
                ...state,
                collection: updateCollection(collection, action.id, {
                    x: action.x,
                    y: action.y
                })
            };
        case 'CONCEPT_FOCUS':
            return {...state, selectedConcept: action.id, selectedRelationship: null};
        case 'CONCEPT_CHANGE':
            return {
                ...state,
                collection: updateCollection(collection, action.id, {
                    name: action.name,
                    width: action.width,
                    height: action.height
                })
            };
        case 'CONCEPT_CHANGE_NOTES':
            return {
                ...state,
                collection: updateCollection(collection, action.id, {
                    notes: action.notes
                })
            };
        case 'CONCEPT_CHANGE_UNITS':
            return {
                ...state,
                collection: updateCollection(collection, action.id, {
                    units: action.units
                })
            };
        case 'CONCEPT_CHANGE_GROUP':
            return {
                ...state,
                collection: updateCollection(collection, action.id, {
                    group: action.groupIndex
                })
            };
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