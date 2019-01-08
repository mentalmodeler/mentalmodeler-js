import React, { Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';
import classnames from 'classnames';
// import PropTypes from 'prop-types';

import {
    conceptMove,
    conceptFocus,
    conceptChange,
    conceptDelete,
    relationshipDrawTemp,
    relationshipSetTempTarget,
    relationshipAdd,
    relationshipFocus
} from '../../actions/index';

import './Concept.css';


// const TEXTAREA_STYLES = {
//     fontSize: 14,
//     lineHeight: 18,
//     padding: 6
// };

// const arrowheadHeight = 16; // 6
// const arrowheadWidth = 16; // 9

class Concept extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.name || '',
            isOver: false,
            lineMouseDown: false
        }

        this.height = 0;
        this.width = 0;
        this.centerClickDiffX = 0;
        this.centerClickDiffY = 0;

        // console.log('this.props:', this.props);
    }


    componentDidMount() {
        if (this.textarea) {
            // initialize autoExpand;
            this.textarea.style.overflow = 'hidden';
            this.autoExpand();
        }
    }

    debouncedConceptChange = debounce(() => {
        if (this.root) {
            const {id, conceptChange} = this.props;
            const {value} = this.state;
            const {width, height} = this.root.getBoundingClientRect();
            const roundedWidth = Math.round(width);
            const roundedHeight = Math.round(height);
            this.width = roundedWidth;
            this.height = roundedHeight;
            conceptChange(id, value, roundedWidth, roundedHeight);
        }
    }, 300)

    componentDidUpdate(prevProps, prevState) {
        const valueChanged = this.state.value !== prevState.value;
        if (valueChanged) {
            this.autoExpand();
        }
    }

    toggleDragHandlers(on, e) {
        const func = on ? 'addEventListener' : 'removeEventListener';
        window[func]('mousemove', this.onMouseMove);
        window[func]('mouseup', this.onMouseUp);
    }

    autoExpand() {
        // Set the height to 0, so we can get the correct content height via scrollHeight
        // Also, running this through state changes causes a race condition when decreasing scrollHeight.
        this.textarea.style.overflow = 'hidden';
        this.textarea.style.height = '0px';
        
        // set height to scrollHeight, but add border-width * 2 since that is not reported in scrollHeight
        // but is used in box-sizing: border-box to determine height of textarea element
        const newHeight = this.textarea.scrollHeight;
        // console.log('newHeight:', newHeight);
        // const paddingAdj = TEXTAREA_STYLES.padding * 2;
        // console.log('newHeight:', newHeight);
        this.height = newHeight; // - paddingAdj;
        this.textarea.style.height = `${this.height}px`;

        this.debouncedConceptChange();
    }

    onChange = (e) => {
        const { value } = this.state;
        const newValue = e.target.value;
        if (newValue !== value) {
            this.setState({
                value: newValue
            });
        }
    }

    getSelectedConceptData() {
        const data = {};
        ['id', 'name', 'notes', 'units', 'preferredState', 'group', 'relationships', 'x', 'y', 'width', 'height'].forEach((key) => {
            data[key] = this.props[key];
        });
        return data;
    }

    onMouseDown = (e) => {
        const {id, selected, conceptFocus, x, y} = this.props;
        const lineButtonMouseDown = e.target === this.lineButtonRef;
        
        // store positions
        this.screenXBeforeDrag = e.screenX;
        this.screenYBeforeDrag = e.screenY;
        this.xBeforeDrag = parseInt(x, 10);
        this.yBeforeDrag = parseInt(y, 10);

        if (lineButtonMouseDown) {
            const rect = this.root.getBoundingClientRect();
            const middleX = rect.x + rect.width / 2;
            const middleY = rect.y + rect.height / 2;
            this.centerClickDiffX = e.clientX - middleX;
            this.centerClickDiffY = e.clientY - middleY;
            this.xBeforeDrag = middleX;
            this.yBeforeDrag = middleY;
        }

        if (!selected) {
            conceptFocus(id);
        }

        if (lineButtonMouseDown && !this.state.lineMouseDown) {
            this.setState({
                lineMouseDown: true
            });
        }
        
        this.toggleDragHandlers(true, e);
    }

    onMouseMove = (e) => {
        const {id, conceptMove, relationshipDrawTemp, x, y, width} = this.props; // eslint-disable-line
        const {lineMouseDown} = this.state;

        const deltaX = e.screenX - this.screenXBeforeDrag;
        const deltaY = e.screenY - this.screenYBeforeDrag;
        const newX = Math.max(deltaX + this.xBeforeDrag, 0);
        const newY = Math.max(deltaY + this.yBeforeDrag, 0);
        // const newX = Math.max(0, e.movementX + x);
        // const newY = Math.max(0, e.movementY + y);
        if (lineMouseDown) {
            relationshipDrawTemp(id, true, this.xBeforeDrag, this.yBeforeDrag, newX, newY, this.width, this.height, this.centerClickDiffX, this.centerClickDiffY);
        } else {
            conceptMove(id, newX, newY);
        }
    }

    onMouseUp = (e) => {
        const {id, relationshipDrawTemp, relationshipAdd, tempTarget} = this.props;
        const {lineMouseDown} = this.state;
        this.toggleDragHandlers(false, e);
        if (lineMouseDown) {
            if (tempTarget !== null && id !== tempTarget) {
                relationshipAdd(id, tempTarget);
            }
            this.centerClickDiffX = 0;
            this.centerClickDiffY = 0;
            relationshipDrawTemp(id, false);
            this.setState({
                lineMouseDown: false
            });

            
        }
    }

    onMouseOver = (e) => {
        const {id, hasTempRelationship, relationshipSetTempTarget} = this.props;
        if (hasTempRelationship) {
            relationshipSetTempTarget(id)
        }
    }

    onMouseOut = (e) => {
        const {hasTempRelationship, relationshipSetTempTarget} = this.props;
        if (hasTempRelationship) {
            relationshipSetTempTarget(null)
        }
    }

    onFocus = (e) => {
        const {id, selected, conceptFocus} = this.props;
        if (!selected) {
            conceptFocus(id);
        }
    }

    onBlur = (e) => {}

    setRef = (ref) => {
        this.root = ref;
    }

    setTextareaRef = (ref) => {
        this.textarea = ref;
    }

    onClickDelete = (e) => {
        const {id, conceptDelete} = this.props;
        conceptDelete(id);
    }
    
    setLineButtonRef = (ref) => {
        this.lineButtonRef = ref;
    }

    render() {
        const { id, name, selected, x, y, group = '0', hasTempRelationship, isTempRelationship, isExcludedByFilter} = this.props // eslint-disable-line
        const { value, lineMouseDown } = this.state
        const rootStyle = {
            left: `${x}px`,
            top: `${y}px`
        }
        const groupNum = group || '0';
        // console.log('groupNum:', groupNum);
        // console.log(id, '> isExcludedByFilter:', isExcludedByFilter);
        const rootClassnames = classnames('Concept', `Concept--group-${groupNum}`, {
            'Concept--focused': selected,
            'Concept--line-mouse-down': lineMouseDown,
            'Concept--temp-relationship-exists': hasTempRelationship,
            'Concept--is-temp-relationship': isTempRelationship,
            'Concept--excluded-by-filter': isExcludedByFilter
        });


        const bgClassnames = classnames('Concept__bg', `Concept__bg--group-${groupNum}`, {
            'Concept__bg--focused': selected,
        });
        
        // console.log('\t\tConcept >', this.props.id, '> render');

        return (
            <div
                className={rootClassnames}
                style={rootStyle}
                ref={this.setRef}
                onMouseDown={this.onMouseDown}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                dataid={id}
            >
            <textarea
                    className="Concept__textarea"
                    value={value}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onChange={this.onChange}
                    ref={this.setTextareaRef}
                    placeholder="Enter name"
                />
                <div className="Concept__button-wrapper Concept__button-wrapper--top">
                    <button 
                        className="Concept__button Concept__button--top"
                        onClick={this.onClickDelete}
                        tabIndex={-1}
                    >
                        <svg className="Concept__icon--trash" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 900.5 900.5">
                            <g>
                                <path d="M176.415,880.5c0,11.046,8.954,20,20,20h507.67c11.046,0,20-8.954,20-20V232.487h-547.67V880.5L176.415,880.5z
                                    M562.75,342.766h75v436.029h-75V342.766z M412.75,342.766h75v436.029h-75V342.766z M262.75,342.766h75v436.029h-75V342.766z"/>
                                <path d="M618.825,91.911V20c0-11.046-8.954-20-20-20h-297.15c-11.046,0-20,8.954-20,20v71.911v12.5v12.5H141.874
                                    c-11.046,0-20,8.954-20,20v50.576c0,11.045,8.954,20,20,20h34.541h547.67h34.541c11.046,0,20-8.955,20-20v-50.576
                                    c0-11.046-8.954-20-20-20H618.825v-12.5V91.911z M543.825,112.799h-187.15v-8.389v-12.5V75h187.15v16.911v12.5V112.799z"/>
                            </g>
                        </svg>
                    </button>
                </div>
                <div  className="Concept__button-wrapper Concept__button-wrapper--bottom">
                    <button
                        className="Concept__button Concept__button--bottom"
                        ref={this.setLineButtonRef}
                        tabIndex={-1}
                    >
                        <svg className="Concept__icon--line" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style={{enableBackground: 'new 0 0 612 612'}} xmlSpace="preserve">
                            <g>
                                <path d="M306,0C137.012,0,0,136.992,0,306s137.012,306,306,306s306-137.012,306-306S475.008,0,306,0z M431.001,322.811
                                    l-108.19,108.19c-4.59,4.59-10.862,6.005-16.811,4.953c-5.929,1.052-12.221-0.382-16.811-4.953l-108.19-108.19
                                    c-7.478-7.478-7.478-19.583,0-27.042c7.478-7.478,19.584-7.478,27.043,0l78.833,78.814V172.125
                                    c0-10.557,8.568-19.125,19.125-19.125c10.557,0,19.125,8.568,19.125,19.125v202.457l78.814-78.814
                                    c7.478-7.478,19.584-7.478,27.042,0C438.46,303.227,438.46,315.333,431.001,322.811z"/>
                            </g>
                        </svg>
                    </button>
                </div>
                <div  className={bgClassnames}></div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        conceptMove: (id, x, y) => {
            dispatch(conceptMove(id, x, y))
        },

        conceptFocus: (id) => {
            dispatch(conceptFocus(id))
        },

        conceptChange: (id, text, width, height) => {
            dispatch(conceptChange(id, text, width, height))
        },

        conceptDelete: (id) => {
            dispatch(conceptDelete(id))
        },

        relationshipDrawTemp: (id, drawing, startX, startY, endX, endY, width, height, centerClickDiffX, centerClickDiffY) => {
            dispatch(relationshipDrawTemp(id, drawing, startX, startY, endX, endY, width, height, centerClickDiffX, centerClickDiffY))
        },

        relationshipSetTempTarget: (id) => {
            dispatch(relationshipSetTempTarget(id));
        },

        relationshipAdd: (influencerId, influenceeId) => {
            dispatch(relationshipAdd(influencerId, influenceeId));
        },

        relationshipFocus: (influencerId, influenceeId) => {
            dispatch(relationshipFocus(influencerId, influenceeId));
        },
    };
}

export default connect(null, mapDispatchToProps)(Concept);