
import {combineReducers} from 'redux';

const updateCollectionConcept = function (collection, id, updatedProps = {}) {
    return collection.map((concept) => (concept.id == id ? {...concept, ...updatedProps} : concept));
};

const updateCollectionRelationship = function (collection, influencerId, influenceeId, updatedProps = {}) {
    // console.log('updateCollectionRelationship\n\tinfluencerId:', influencerId, ', influenceeId:', influenceeId, ', updatedProps:', updatedProps);
    return  collection.map((concept) => {
        if (concept.id == influencerId && concept.relationships && concept.relationships.length > 0) {
            const newRelationshipIndex = concept.relationships.findIndex((relationship) => (relationship.id == influenceeId));
            if (newRelationshipIndex > -1) {
                let newRelationship = concept.relationships[newRelationshipIndex];
                newRelationship = {...newRelationship, ...updatedProps};
                const newRelationships = concept.relationships.slice();
                newRelationships.splice(newRelationshipIndex, 1, newRelationship);
                return {...concept, relationships: newRelationships};
            }
        }
        return concept;
    });

};

const concepts = (state = {collection:[], selectedConcept: null, selectedRelationship:null}, action) => {
    // console.log('concepts\naction:', action, ', \nstate:', state);
    const {collection, selectedConcept, selectedRelationship} = state;
    let newCollection = [];
    switch (action.type) {
        case 'CONCEPT_MOVE':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    x: action.x,
                    y: action.y
                })
            };
        case 'CONCEPT_FOCUS':
            return {...state, selectedConcept: action.id, selectedRelationship: null};
        case 'RELATIONSHIP_FOCUS':
            return {...state, selectedConcept: action.influencerId, selectedRelationship: action.influenceeId};
        case 'RELATIONSHIP_CHANGE_CONFIDENCE':
            return {
                ...state,
                collection: updateCollectionRelationship(collection, action.influencerId, action.influenceeId, {
                    confidence: action.value
                })
            };
        case 'CONCEPT_CHANGE':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    name: action.name,
                    width: action.width,
                    height: action.height
                })
            };
        case 'CONCEPT_CHANGE_NOTES':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    notes: action.notes
                })
            };
        case 'CONCEPT_CHANGE_UNITS':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    units: action.units
                })
            };
        case 'CONCEPT_CHANGE_GROUP':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
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