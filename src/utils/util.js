const LINE_VALUE_INDICATOR_WIDTH = 26;
const ELEMENT_TYPE = {
    CONCEPT: 'concept',
    RELATIONSHIP: 'relationship'
};
const SETTINGS = {
    START_X: 20,
    START_Y: 20,
    CONCEPT_START_INCR: 10,
    CONTROLS_WIDTH: 180,
    CONTROLS_HEIGHT: 44
};

const CONFIDENCE__VALUES = [3, 2, 1, 0, -1, -2, -3];

const util = {
    initData(data) {
        const {
            concepts,
            groupNames,
            info,
            scenarios
        } = data;
        
        // initialize and format concept and relationship data
        
        // old way
        // const collection = [...concepts]; util.parsePositionData(collection);
        
        // new way
        const collection = concepts.map((concept) => {
            const relationships = concept && concept.relationships ? concept.relationships : [];
            const newRelationships = relationships.map((relationship) => {
                if (!relationship.inDualRelationship) {
                    const {makesDualRelationship, otherRelationship} = util.makesDualRelationship(concepts, concept.id, relationship.id);
                    if (makesDualRelationship && otherRelationship) {
                        relationship.inDualRelationship = true;
                        relationship.isFirstInDualRelationship = false;
                        otherRelationship.inDualRelationship = true;
                        otherRelationship.isFirstInDualRelationship = true;
                    }
                }    
                return {...relationship, influence: parseFloat(relationship.influence)}
            });

            return {...concept, relationships: newRelationships, x: parseInt(concept.x, 10), y: parseInt(concept.y, 10)};
        })
        
        return {
            concepts: {
                collection,
                selectedConcept: null,
                selectedRelationship: null,
                tempRelationship: null,
                tempTarget: null,
                viewFilter: -1
            },
            groupNames,
            info,
            scenarios
        };
    },

    exportData(state = {}) {
        let concepts = [];
        let groupNames = {0: '', 1: '', 2: '', 3: '', 4: '', 5: ''};
        if (state.groupNames) {
            groupNames = {...groupNames, ...state.groupNames};
        }
        if (state.concepts && state.concepts.collection) {
            concepts = [...state.concepts.collection];
        }
        const js = {concepts, groupNames};
        return {
            js,
            json: JSON.stringify(js)
        };
    },

    getConceptsPosition(collection) {
        const positions = {};
        collection.forEach((concept) => {
            positions[concept.id] = {
                x: parseInt(concept.x, 10),
                y: parseInt(concept.y, 10),
                width: concept.width,
                height: concept.height
            };

        });
        return positions;
    },

    getPosition(id, positions) {
        return positions[id] || {x: 0, y: 0, width: 0, height: 0};
    },

    getDistanceBetweenPoints(x1, y1, x2, y2) {
        const a = x1 - x2;
        const b = y1 - y2;
        return Math.sqrt(a * a + b * b);
    },

    getOffset(inDualRelationship, isFirstInDualRelationship) {
        if (inDualRelationship) {
            return isFirstInDualRelationship
                ? LINE_VALUE_INDICATOR_WIDTH / 2
                : - LINE_VALUE_INDICATOR_WIDTH / 2;
        }
        return 0;
    },

    determineEdgePoint({eeX, eeY, erX, erY, eeWidth, eeHeight, inDualRelationship = false, isFirstInDualRelationship = false}) {
        let pct;
        const dist = util.getDistanceBetweenPoints(eeX, eeY, erX, erY);
        const eeRadians = Math.atan2(erX - eeX, erY - eeY);
        const w = eeWidth / 2 + (erX > eeX 
            ? - util.getOffset(inDualRelationship, isFirstInDualRelationship)
            : util.getOffset(inDualRelationship, isFirstInDualRelationship));
        const h = eeHeight / 2;
        const cos = Math.cos(eeRadians);
        let hypo = Math.abs(h / cos);
        const opposite = Math.sqrt(Math.pow(hypo, 2) - Math.pow(h, 2));
        const adj = 0;
        if (opposite < w) {
            pct = (dist - hypo + adj) / dist;
            pct = 1 - pct;
        } else {
            const sin = Math.sin(eeRadians);
            hypo = Math.abs(w / sin);
            pct = (dist - hypo + adj) / dist;
            pct = 1 - pct;
        }
        const x = eeX + (erX - eeX) * pct;
        const y = eeY + (erY - eeY) * pct;
        
        return {x, y};
    },

    findConcept(collection, id) {
        return collection.find((concept) => (concept.id === id));
    },

    getPropValue(object = {}, path = [], defaultValue = '') {
        let o = object;
        let found = false;
        while (path.length > 0) {
            const prop = path.shift();
            if (o && o.hasOwnProperty(prop)) {
                o = o[prop];
                found = true;
            } else {
                return defaultValue;
            }
        }
        return found
            ? o
            : defaultValue;
    },

    createId() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // const dashSpots = [8, 13, 18, 23];
        // return [...Array(36)].map((value, index) => (
        //     dashSpots.indexOf(index) > -1
        //         ? '-'
        //         : chars[Math.floor(Math.random() * (index === 0 ? 26 : chars.length))]
        // )).join('');
        return [...Array(19)].map((value, index) => {
            if (index === 0) {
                return chars[Math.floor(Math.random() * chars.length - 10)]
            }
            return (index + 1) % 5 === 0
                ? '-'
                : chars[Math.floor(Math.random() * chars.length)]
        }).join('');
    },

    normalize(value, min = -1, max = 1) {
        return Math.max(Math.min(value, max), min);
    },

    makesDualRelationship(collection, influencerId, influenceeId) {
        const ee = util.findConcept(collection, influenceeId);
        const relationships = ee && ee.relationships ? ee.relationships : [];
        const relationship = relationships.find((r) => (r.id === influencerId))
        return {
            makesDualRelationship: !!relationship,
            otherRelationship: relationship
        };
    },

    isConceptExcludedByFilter({viewFilter, selectedConcept, selectedRelationships, concept, collection}) {
        switch (viewFilter) {
            case 0: // lines from
                return !(
                    concept.id === selectedConcept
                        || selectedRelationships.some((relationship) => (concept.id === relationship.id))
                );
            case 1: // lines to
                    return concept.id === selectedConcept
                        ? false
                        : !concept.relationships.some((relationship) => (relationship.id === selectedConcept));
            default:
                return false
        }
    },

    isRelationshipExcludedByFilter({viewFilter, selectedConcept, concept, influencerId, influenceeId, collection}) {
        switch (viewFilter) {
            case 0: // lines from
                return concept.id !== selectedConcept;
            case 1: // lines to
                return influenceeId !== selectedConcept;
            default:
                return false;
        }
    },

    isConceptAtPosition(collection = [], x = SETTINGS.START_X, y = SETTINGS.START_X) {
        return collection.some((concept) => (concept.x === x && concept.y === y))
    },

    getStartPosition(collection) {
        let x = SETTINGS.START_X;
        let y = SETTINGS.START_Y;
        let startX = -1;
        let startY = -1;
        while (startX < 0 && startY < 0) {
            if (!util.isConceptAtPosition(collection, x, y)) {
                startX = x;
                startY = y;
            } else {
                x += SETTINGS.CONCEPT_START_INCR;
                y += SETTINGS.CONCEPT_START_INCR;
            }
        }
        return {x: startX, y: startY};
    }
};

export {
    util,
    ELEMENT_TYPE,
    CONFIDENCE__VALUES,
    SETTINGS
};

export default util;