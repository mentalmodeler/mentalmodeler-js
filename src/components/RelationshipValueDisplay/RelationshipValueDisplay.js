import React, { Component } from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import ReactDOM from 'react-dom';

import util from '../../utils/util';

import {
    relationshipChangeInfluence,
    relationshipDelete,
    relationshipFocus
} from '../../actions/index';

import './RelationshipValueDisplay.css';

class RelationshipValueDisplay extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            expanded: false,
            positionPct: 0.5,
            influenceValue: this.props.influence || 0,
            tempInfluenceTextValue: this.props.influence || 0
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.expanded && !this.props.expanded) {
            this.expandMenu();
        }
    }

    componentDidMount() {
        if (this.state.expanded) {
            this.toggleWindowMouseDownListener(true);
        }
    }

    toggleWindowMouseDownListener(enable) {
        if (typeof window !== 'undefined') {
            window.removeEventListener('mousedown', this.handleWindowMouseDown);

            if (enable) {
                window.addEventListener('mousedown', this.handleWindowMouseDown);
            }
        }
    }

    handleWindowMouseDown = (e) => {
        if (this.state.expanded && this.root && !this.root.contains(e.target)) {
            this.toggleWindowMouseDownListener(false);
            this.setState({
                expanded: false
            })
        }
    }

    debouncedChangeInfluenceText = debounce(() => {
        this.setTextValue();
    }, 2000)

    onChangeInfluenceSlider = (e) => {
        const {influenceValue} = this.state;
        const {influencerId, influenceeId} = this.props;
        const value = e.target.value;
        if (value !== influenceValue) {
            this.props.relationshipChangeInfluence(influencerId, influenceeId, value);
            this.setState({
                influenceValue: value,
                tempInfluenceTextValue: value
            });
        }
    }

    onChangeInfluenceText = (e) => {
        const {tempInfluenceTextValue} = this.state;
        const value = e.target.value;
        if (value !== tempInfluenceTextValue) {
            this.setState({
                tempInfluenceTextValue: value
            });
        }
        this.debouncedChangeInfluenceText();
    }

    setTextValue = () => {
        const {tempInfluenceTextValue, influenceValue} = this.state;
        const parsedValue = parseFloat(tempInfluenceTextValue);
        let value = influenceValue;
        if (!isNaN(parsedValue)) {
            let norm = util.normalize(parsedValue);
            if (norm !== influenceValue) {
                value = norm;
            }
        }
        if (value !== influenceValue || value !== tempInfluenceTextValue) {
            if (value !== influenceValue) {
                const {influencerId, influenceeId} = this.props;
                this.props.relationshipChangeInfluence(influencerId, influenceeId, value);
            }
            this.setState({
                influenceValue: value,
                tempInfluenceTextValue: value
            });
        }
    }

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.setTextValue();
        }
    }

    onClickDelete = (e) => {
        const {influencerId, influenceeId, relationshipDelete} = this.props;
        relationshipDelete(influencerId, influenceeId);
    }

    onClickExpand = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        relationshipFocus(influencerId, influenceeId);
        this.expandMenu();
        
    }

    expandMenu() {
        if (!this.state.expanded) {
            this.setState({
                expanded: true
            });
            this.toggleWindowMouseDownListener(true);
        }
    }

    setRef = (ref) => {
        this.root = ref;
    }

    render() {
        const {expanded, positionPct, influenceValue, tempInfluenceTextValue} = this.state;
        const {erX, erY, eeX, eeY, selfRelationship, selfRelationshipX, selfRelationshipY} = this.props;
        const x = !selfRelationship
            ? eeX + (erX - eeX) * positionPct
            : selfRelationshipX + 8;
        const y = !selfRelationship
            ? eeY + (erY - eeY) * positionPct
            : selfRelationshipY + 24;
        if (selfRelationship) {
            console.log('selfRelationship:', selfRelationship);
        }
        let posStyle = expanded
            ? {
                left: `${x - 21}px`,
                top: `${y - 70}px`,
                zIndex: '3'
            }
            : {
                left: `${x - 12}px`,
                top: `${y - 12}px`,
            };
        let display = '?';
        if (influenceValue !== 0) {
            display = influenceValue > 0
                ? '+'
                : '–';
        }
        
        const collapsedClasses = classnames('relationship-value-display__collapsed', {
            'relationship-value-display__collapsed--has-influence-value' : influenceValue !== 0
        });

        const expandedClasses = classnames('relationship-value-display__expanded', {});
        const domNode = document && document.querySelector('.MentalMapper .map__content');
        if (!expanded) {
            return (
                <div className="relationship-value-display" style={posStyle} ref={this.setRef}>
                    <button className={collapsedClasses} onClick={this.onClickExpand}>
                        <div><span>{display}</span></div>
                    </button>
                </div>
            )    
        }
        else if (domNode) {
            return ReactDOM.createPortal(
                <div className="relationship-value-display relationship-value-display--expanded" style={posStyle} ref={this.setRef}>
                    <div className={expandedClasses}>
                        <button className="relationship-value-display__delete" onClick={this.onClickDelete}>
                            <svg className="relationship-value-display__delete-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 900.5 900.5">
                                <g>
                                    <path d="M176.415,880.5c0,11.046,8.954,20,20,20h507.67c11.046,0,20-8.954,20-20V232.487h-547.67V880.5L176.415,880.5z
                                        M562.75,342.766h75v436.029h-75V342.766z M412.75,342.766h75v436.029h-75V342.766z M262.75,342.766h75v436.029h-75V342.766z"/>
                                    <path d="M618.825,91.911V20c0-11.046-8.954-20-20-20h-297.15c-11.046,0-20,8.954-20,20v71.911v12.5v12.5H141.874
                                        c-11.046,0-20,8.954-20,20v50.576c0,11.045,8.954,20,20,20h34.541h547.67h34.541c11.046,0,20-8.955,20-20v-50.576
                                        c0-11.046-8.954-20-20-20H618.825v-12.5V91.911z M543.825,112.799h-187.15v-8.389v-12.5V75h187.15v16.911v12.5V112.799z"/>
                                </g>
                            </svg>
                        </button>
                        <div className="relationship-value-display__slider-wrapper">
                            <div className="relationship-value-display__slider-bg">
                                <div className="relationship-value-display__slider-bg-left">
                                    <svg className="relationship-value-display__increase-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20 40">
                                        <polygon points="5,0 18,0 18,40"/>
                                    </svg>
                                    <svg className="relationship-value-display__decrease-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20 40">
                                        <polygon points="18,0 5,40 18,40"/>
                                    </svg>
                                </div>
                                <div className="relationship-value-display__slider-bg-right">
                                    <span className="relationship-value-display__plus-icon">{'+'}</span>
                                    <span className="relationship-value-display__minus-icon">{'–'}</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                className="relationship-value-display__slider"
                                orient="vertical"
                                max="1"
                                min="-1"
                                step="0.01"
                                value={influenceValue}
                                onChange={this.onChangeInfluenceSlider}
                            />
                        </div>                        
                        <input
                            type="text"
                            className="relationship-value-display__input"
                            maxLength="5"
                            value={tempInfluenceTextValue}
                            onChange={this.onChangeInfluenceText}
                            onBlur={this.setTextValue}
                            onKeyDown={this.onKeyDown}
                        />
                    </div>
                </div>,
                domNode
            );
        }
        return <div/>;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        relationshipChangeInfluence: (influencerId, influenceeId, value) => {
            dispatch(relationshipChangeInfluence(influencerId, influenceeId, value))
        },

        relationshipDelete: (influencerId, influenceeId) => {
            dispatch(relationshipDelete(influencerId, influenceeId))
        },

        relationshipFocus: (influencerId, influenceeId) => {
            dispatch(relationshipFocus(influencerId, influenceeId))
        }
    };
}

export default connect(null, mapDispatchToProps)(RelationshipValueDisplay);