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

const conceptChangeNotes = (id, notes) => {
    return {
        type: 'CONCEPT_CHANGE_NOTES',
        id,
        notes
    }
};

const conceptChangeUnits = (id, units) => {
    return {
        type: 'CONCEPT_CHANGE_UNITS',
        id,
        units
    }
};

const conceptChangeGroup = (id, groupIndex) => {
    return {
        type: 'CONCEPT_CHANGE_GROUP',
        id,
        groupIndex
    }
};

const conceptDelete = (id) => {
    return {
        type: 'CONCEPT_DELETE',
        id
    }
};

const conceptAdd = () => {
    return {
        type: 'CONCEPT_ADD'
    }
};

const relationshipFocus = (influencerId, influenceeId) => {
    return {
        type: 'RELATIONSHIP_FOCUS',
        influencerId,
        influenceeId
    }
};

const relationshipDrawTemp = (id, drawing, startX, startY, endX, endY, width, height, centerClickDiffX, centerClickDiffY) => {
    // console.log('relationshipDrawTemp\n\tdrawing:', drawing, ', startX:', startX, ', startY:', startY, ', endX:', endX, ', endY:', endY, ' width:', width,  ', height:', height, ', centerClickDiffX:', centerClickDiffX, ', centerClickDiffY:', centerClickDiffY);
    // console.log('relationshipDrawTemp\n\tdrawing:', drawing, '\n\t centerClickDiffX:', centerClickDiffX, ', centerClickDiffY:', centerClickDiffY);
    return {
        type: 'RELATIONSHIP_DRAW_TEMP',
        id,
        drawing,
        startX,
        startY,
        endX,
        endY,
        width,
        height,
        centerClickDiffX,
        centerClickDiffY
    }
};

const relationshipSetTempTarget = (id) => {
    return {
        type: 'RELATIONSHIP_SET_TEMP_TARGET',
        id
    }
};

const relationshipAdd = (influencerId, influenceeId) => {
    return {
        type: 'RELATIONSHIP_ADD',
        influencerId,
        influenceeId
    }
};

const relationshipChangeConfidence = (influencerId, influenceeId, value) => {
    return {
        type: 'RELATIONSHIP_CHANGE_CONFIDENCE',
        influencerId,
        influenceeId,
        value
    }
};

const relationshipChangeInfluence = (influencerId, influenceeId, value) => {
    return {
        type: 'RELATIONSHIP_CHANGE_INFLUENCE',
        influencerId,
        influenceeId,
        value
    }
}

const relationshipDelete = (influencerId, influenceeId) => {
    console.log('relationshipDelete\n\tinfluencerId:', influencerId, '\n\tinfluenceeId:', influenceeId);
    return {
        type: 'RELATIONSHIP_DELETE',
        influencerId,
        influenceeId
    }
}

const modelLoad = (state) => {
    return {
        type: 'MODEL_LOAD',
        state
    }
}

const viewFilterChange = (index) => {
    return {
        type: 'VIEW_FILTER_CHANGE',
        index
    }
}

const groupNameChange = (index, name) => {
    return {
        type: 'GROUP_NAME_CHANGE',
        index,
        name
    }
};

export {
    conceptMove,
    conceptFocus,
    conceptChange,
    conceptDelete,
    conceptChangeNotes,
    conceptChangeUnits,
    conceptChangeGroup,
    conceptAdd,
    relationshipFocus,
    relationshipChangeConfidence,
    relationshipDrawTemp,
    relationshipSetTempTarget,
    relationshipAdd,
    relationshipChangeInfluence,
    relationshipDelete,
    modelLoad,
    viewFilterChange,
    groupNameChange
};