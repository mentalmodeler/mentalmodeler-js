
import {combineReducers} from 'redux';
import util from '../utils/util';

const createRelationship = function(props = {}) {
    return {...{id: '', name: '', notes:  '', confidence: 0, influence: 0}, ...props};
}

const createConcept = function(props = {}) {
    return {...{id: util.createId(), name: '', notes:  '', units: '', group: 0, x: 20, y: 20, preferredState: 0, relationships: []}, ...props};
}

const updateCollectionConcept = function (collection, id, updatedProps = {}) {
    return collection.map((concept) => (concept.id === id ? {...concept, ...updatedProps} : concept));
};

const removeConceptFromCollection = function (collection, removeId) {
    // remove any relationships pointing to the removed concept
    return collection.map((concept) => (
        {...concept, relationships: removeRelationships(removeId, concept.relationships)}
    )).filter((concept) => (concept.id !== removeId));
};

const removeRelationships = function (influenceeId, relationships = []) {
    return relationships.filter((relationship) => (relationship.id !== influenceeId));
};

const addRelationshipToConcept = function (collection, influencerId, influenceeId) {
    return collection.map((concept) => {
        if (concept.id === influencerId) {
            const relationships =  concept.relationships || [];
            const newRelationships = relationships.slice();
            newRelationships.push(createRelationship({id: influenceeId}));
            return {...concept, relationships: newRelationships};
        }
        return concept;
    });
};

const updateCollectionRelationship = function (collection, influencerId, influenceeId, updatedProps = {}) {
    // console.log('updateCollectionRelationship\n\tinfluencerId:', influencerId, ', influenceeId:', influenceeId, ', updatedProps:', updatedProps);
    return collection.map((concept) => {
        if (concept.id === influencerId && concept.relationships && concept.relationships.length > 0) {
            const newRelationships = concept.relationships.map((relationship) => (
                relationship.id === influenceeId ? {...relationship, ...updatedProps} : relationship
            ));
            return {...concept, relationships: newRelationships};
        }
        return concept;
    });
};

const concepts = (state = {collection:[], selectedConcept: null, selectedRelationship: null, tempRelationship: null, tempTarget: null}, action) => {
    const {collection} = state;
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
        case 'RELATIONSHIP_DRAW_TEMP':
            let tempRelationship = null;
            if (action.drawing) {
                tempRelationship = {
                    id: action.id,
                    startX: action.startX,
                    startY: action.startY,
                    endX: action.endX,
                    endY: action.endY,
                    width: action.width,
                    height: action.height,
                };
            }
            return {
                ...state,
                tempRelationship
            };
        case 'RELATIONSHIP_SET_TEMP_TARGET':
            return {
                ...state,
                tempTarget: action.id
            };
        case 'RELATIONSHIP_ADD':
            console.log('RELATIONSHIP_ADD, action.influencerId:', action.influencerId, ', action.influenceeId:', action.influenceeId);
            return {
                ...state,
                collection: addRelationshipToConcept(collection, action.influencerId, action.influenceeId),
                tempTarget: null
            };
        case 'CONCEPT_ADD':
            const newCollection = collection.slice();
            newCollection.push(createConcept());
            return {
                ...state,
                collection: newCollection
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
        case 'CONCEPT_DELETE':
            return {
                ...state,
                collection: removeConceptFromCollection(collection, action.id)
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