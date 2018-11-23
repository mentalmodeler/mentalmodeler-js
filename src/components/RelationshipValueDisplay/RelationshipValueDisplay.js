import React, { Component } from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

// import {
//     conceptFocus,
//     conceptAdd
// } from '../../actions/index';

import './RelationshipValueDisplay.css';

class RelationshipValueDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: true,
            positionPct: 0.5
        }
    }

    render() {
        const {expanded, positionPct} = this.state;
        const {erX, erY, eeX, eeY, influence} = this.props;
        const x = eeX + (erX - eeX) * positionPct;
        const y = eeY + (erY - eeY) * positionPct;
        const posStyle = expanded
            ? {
                left: `${x - 21}px`,
                top: `${y - 70}px`,
            }
            : {
                left: `${x - 12}px`,
                top: `${y - 12}px`,
            };
        let display = '?';
        if (influence !== 0) {
            display = influence > 0
                ? '+'
                : '–';
        }
        
        const collapsedClasses = classnames('relationship-value-display__collapsed', {
            'relationship-value-display__collapsed--has-influence-value' : influence !== 0
        });

        const expandedClasses = classnames('relationship-value-display__expanded', {});

        return (
            <div className="relationship-value-display" style={posStyle}>
                {!expanded &&
                    <button className={collapsedClasses}>
                        <div><span>{display}</span></div>
                    </button>
                }
                {expanded &&
                    <div className={expandedClasses}>
                        <button className="relationship-value-display__delete">
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
                            <input
                                type="range"
                                className="relationship-value-display__slider"
                                orient="vertical"
                            />
                        </div>                        
                        <input
                            type="text"
                            className="relationship-value-display__input"
                            maxLength="4"
                            value={influence}
                        />
                    </div>
                }
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // conceptFocus: (id) => {
        //     dispatch(conceptFocus(id))
        // },

        // conceptAdd: () => {
        //     dispatch(conceptAdd());
        // }
    };
}

export default connect(null, mapDispatchToProps)(RelationshipValueDisplay);