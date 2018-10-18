const util = {
    getConceptsPosition(concepts) {
        const positions = {};
        concepts.forEach((concept) => {
            positions[concept.id] = {
                x: parseInt(concept.x, 10),
                y: parseInt(concept.y, 10),
                width: concept.width,
                height: concept.height
            };

        });
        return positions;
    },

    parsePositionData(concepts) {
        concepts.forEach((concept) => {
            concept.x = parseInt(concept.x, 10);
            concept.y = parseInt(concept.y, 10);
        });
    }
};

export default util;