const conceptMove = (id, x, y) => {
    return {
        type: 'CONCEPT_MOVE',
        id,
        x,
        y
    }
};

const conceptFocus = (id, data = {}) => {
    return {
        type: 'CONCEPT_FOCUS',
        id,
        data
    }
};

const conceptChange = (id, name, width, height) => {
    return {
        type: 'CONCEPT_CHANGE',
        id,
        name,
        width,
        height
    }
};

const relationshipFocus = (influencerId, influenceeId) => {
    return {
        type: 'RELATIONSHIP_FOCUS',
        influencerId,
        influenceeId
    }
};

export {
    conceptMove,
    conceptFocus,
    conceptChange
};