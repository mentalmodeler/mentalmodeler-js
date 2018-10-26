const LINE_VALUE_INDICATOR_WIDTH = 20;

const util = {
    initData(data) {
        const {
            concepts,
            groupNames,
            info,
            scenarios
        } = data;
        const collection = [...concepts];
        util.parsePositionData(collection);
        return {
            concepts: {
                collection,
                selectedConcept: null,
                selectedRelationship: null
            },
            groupNames,
            info,
            scenarios
        };
    },
    
    parsePositionData(concepts) {
        concepts.forEach((concept) => {
            concept.x = parseInt(concept.x, 10);
            concept.y = parseInt(concept.y, 10);
        });
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

    getOffset(isInDualRelationship, isFirstLineInDualRelationship) {
        if (isInDualRelationship) {
            return isFirstLineInDualRelationship
                ? LINE_VALUE_INDICATOR_WIDTH / 2
                : - LINE_VALUE_INDICATOR_WIDTH / 2;
        }
        return 0;
    },

    determineEdgePoint({eeX, eeY, erX, erY, eeWidth, eeHeight}) {
        let pct;
        const dist = util.getDistanceBetweenPoints(eeX, eeY, erX, erY);
        const eeRadians = Math.atan2(erX - eeX, erY - eeY);
        const w = eeWidth / 2 + (erX > eeX 
            ? - util.getOffset()
            : util.getOffset());
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
    }
};

export default util;