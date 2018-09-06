const conceptMove = (id, x, y) => {
    return {
        type: 'CONCEPT_MOVE',
        id,
        x,
        y
    }
};

const conceptFocus = (id) => {
    return {
        type: 'CONCEPT_FOCUS',
        id
    }
};

export {
    conceptMove,
    conceptFocus
};