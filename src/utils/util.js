const util = {
    getConceptPosition(idToMatch, concepts) {
        const {id, x, y} = concepts.find((concept) => (
            idToMatch === concept.id
        ));
        return {id, x, y};
    },

    getConceptsPosition(concepts) {
        const positions = {};
        concepts.forEach((concept) => {
            positions[concept.id] = {
                x: concept.x,
                y: concept.y
            };

        });
        return positions;
    }
};

export default util;