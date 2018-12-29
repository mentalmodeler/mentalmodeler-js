const LINE_VALUE_INDICATOR_WIDTH = 26;
const ELEMENT_TYPE = {
    CONCEPT: 'concept',
    RELATIONSHIP: 'relationship'
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
                tempTarget: null
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
    
    // parsePositionData(concepts) {
    //     // console.log('parsePositionData')
    //     concepts.forEach((concept) => {
    //         concept.x = parseInt(concept.x, 10);
    //         concept.y = parseInt(concept.y, 10);
    //         const {relationships = []} = concept;
    //         relationships.forEach((relationship) => {
    //             relationship.influence = parseFloat(relationship.influence);
    //             const {makesDualRelationship, otherRelationship} = util.makesDualRelationship(concepts, concept.id, relationship.id);
    //             // console.log('\n\trelationship > ', concept.id, ' to ', relationship.id, '\n\tmakesDualRelationship:', makesDualRelationship, '\n\totherRelationship:', otherRelationship);
    //             if (!relationship.makesDualRelationship && makesDualRelationship && otherRelationship) {
    //                 relationship.inDualRelationship = true;
    //                 relationship.isFirstInDualRelationship = false;
    //                 otherRelationship.inDualRelationship = true;
    //                 otherRelationship.isFirstInDualRelationship = true;
    //                 // console.log('\trelationship:', relationship);
    //                 // console.log('\totherRelationship:', otherRelationship);
    //             }
    //         });
    //     });
    // },

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
        // return relationships.some((relationship) => (
        //     relationship.id = influencerId
        // ));
    }

    // makesDualRelationship(collection, influencerId, influenceeId) {
    //     const ee = util.findConcept(collection, influenceeId);
    //     const relationships = ee && ee.relationships
    //         ? ee.relationships
    //         : [];
    //     return relationships.some((relationship) => (
    //         relationship.id = influencerId
    //     ));
    // }
};

export {
    util,
    ELEMENT_TYPE,
    CONFIDENCE__VALUES
};

export default util;