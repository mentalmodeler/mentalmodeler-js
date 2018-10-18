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

const conceptChange = (id, name, width, height) => {
    return {
        type: 'CONCEPT_CHANGE',
        id,
        name,
        width,
        height
    }
};

export {
    conceptMove,
    conceptFocus,
    conceptChange
};