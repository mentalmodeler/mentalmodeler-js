import {combineReducers} from 'redux';
import {util, SETTINGS} from '../utils/util';

const createRelationship = function(props = {}) {
    return {...{id: '-1', name: '', notes:  '', confidence: 0, influence: 0}, ...props};
}

const createConcept = function(props = {}) {
    return {...{id: util.createId(), name: '', notes:  '', units: '', group: 0, x: SETTINGS.START_X, y: SETTINGS.START_X, preferredState: 0, relationships: []}, ...props};
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

const removeRelationshipFromConcept = function(collection, influencerId, influenceeId) {
    const newCollection = collection.map((concept) => {
        if (concept.id === influencerId) {
            // keep all relationships but this one
            const relationships = concept.relationships || [];
            const newRelationships = relationships.filter((relationship) => (
                relationship.id !== influenceeId
            ));
            // unmark other relationship in dual relationship, if exists
            const {makesDualRelationship, otherRelationship} = util.makesDualRelationship(collection, influencerId, influenceeId);
            if (makesDualRelationship && otherRelationship) {
                otherRelationship.inDualRelationship = false;
                otherRelationship.isFirstInDualRelationship = false;
            }
            return {...concept, relationships: newRelationships};
        }
        return concept;
    });

    return newCollection;
}

const addRelationshipToConcept = function (collection, influencerId, influenceeId) {
    let inDualRelationship = false;
    
    let newCollection = collection.map((concept) => {
        if (concept.id === influencerId) {
            const relationships =  concept.relationships ? [...concept.relationships] : [];
            const alreadyHasRelationship = !!(relationships.find(relationship => relationship.id === influenceeId))
            if (!alreadyHasRelationship) {
                // check to see if would make dual relationship
                const {makesDualRelationship, otherRelationship} = util.makesDualRelationship(collection, influencerId, influenceeId);
                // const influenceeConcept = util.findConcept(collection, influenceeId)
                inDualRelationship = makesDualRelationship;
                relationships.push(createRelationship({
                    id: influenceeId,
                    inDualRelationship,
                    isFirstInDualRelationship: false
                    // ...(influenceeConcept && {name: influenceeConcept.name}) 
                }));
                //  directly manipulating object.
                if (otherRelationship) {
                    otherRelationship.inDualRelationship = true;
                    otherRelationship.isFirstInDualRelationship = true;
                }
            }
            return {...concept, relationships: relationships};
        }
        return concept;
    });
    
    return newCollection;
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

const concepts = (
    state = {
        collection:[],
        selectedConcept: null,
        selectedRelationship: null,
        tempRelationship: null,
        tempTarget: null,
        viewFilter: -1
    },
    action) => {
    // console.log('concepts REDUCER, action:', action);
    if (typeof state.viewFilter === 'undefined' || state.viewFilter === null) {
        state.viewFilter = -1
    }
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
        case 'RELATIONSHIP_CHANGE_NOTES':
            console.log('RELATIONSHIP_CHANGE_NOTES, action.notes:', action.notes);
            return {
                ...state,
                collection: updateCollectionRelationship(collection, action.influencerId, action.influenceeId, {
                    notes: action.notes
                })
            };
        case 'RELATIONSHIP_CHANGE_INFLUENCE':
            return {
                ...state,
                collection: updateCollectionRelationship(collection, action.influencerId, action.influenceeId, {
                    influence: action.value
                })
            };
        case 'RELATIONSHIP_DELETE':
            return {
                ...state,
                selectedConcept: null,
                selectedRelationship: null,
                collection: removeRelationshipFromConcept(collection, action.influencerId, action.influenceeId)
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
                    centerClickDiffX: action.centerClickDiffX,
                    centerClickDiffY: action.centerClickDiffY
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
            // console.log('RELATIONSHIP_ADD, action.influencerId:', action.influencerId, ', action.influenceeId:', action.influenceeId);
            return {
                ...state,
                collection: addRelationshipToConcept(collection, action.influencerId, action.influenceeId),
                selectedConcept: action.influencerId,
                selectedRelationship: action.influenceeId,
                tempTarget: null
            };
        case 'CONCEPT_ADD':
            const newCollection = [...collection];
            const {x, y} = util.getStartPosition(newCollection)
            newCollection.push(createConcept({x, y}));
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
        case 'VIEW_FILTER_CHANGE':
            return {
                ...state,
                viewFilter: action.index
            };
        case 'AUTO_LAYOUT_CHANGE':
                console.log('AUTO_LAYOUT_CHANGE, action.nodesep:', action.nodesep, ', action.edgesep:', action.edgesep, ', action.ranksep:', action.ranksep);
                return {
                    ...state,
                };
        default:
            return state;
    }
}

const groupNames = (state = {0: '', 1: '', 2: '', 3: '', 4: '', 5: ''}, action) => {
    // console.log('groupName\naction:', action, ', \nstate:', state);
    switch (action.type) {
        case 'GROUP_NAME_CHANGE':
            return {...state, [action.index]: action.name};
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

const appReducers = combineReducers({
    concepts,
    groupNames,
    info,
    scenarios
});

const allReducers = (state, action) => {
    // console.log('allReducers, action:', action);
    if (action.type === 'MODEL_LOAD') {
        state = action.state || {}
    }
    return appReducers(state, action)
}

export default allReducers;