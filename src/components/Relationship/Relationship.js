import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {relationshipFocus} from '../../actions/index';

import RelationshipValueDisplay from '../RelationshipValueDisplay/RelationshipValueDisplay';
import util from '../../utils/util';

import './Relationship.css';

const arrowheadHeight = 16; // 6
const arrowheadWidth = 16; // 9

class Relationship extends Component {
    setRef = (ref) => {
        this.root = ref;
    }

    onClick = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        relationshipFocus(influencerId, influenceeId);

        // const {comboId, influence} = this.props;
        // console.log(comboId, '> click, influence:', influence);
    }

    render() {
        const {
            // comboId,
            influence,
            // influenceeId,
            influenceeX,
            influenceeY,
            influenceeWidth,
            influenceeHeight,
            // influencerId,
            influencerX,
            influencerY,
            influencerWidth,
            influencerHeight,
            selected,
            className,
            tempLine,
            hasTempRelationship
        } = this.props

        const sizeData = [influenceeWidth, influenceeHeight, influencerWidth, influencerHeight];
        const missingSomeSizeData = sizeData.some((value) => (!value));
        if (missingSomeSizeData && !tempLine) {
            return null;
        }

        const influenceAbsValue = Math.abs(influence);
        const lineThickness = Math.round(influenceAbsValue * 3 + 1);
        let erX = influencerX + influencerWidth / 2;
        let erY = influencerY + influencerHeight / 2;
        let eeX = influenceeX + influenceeWidth / 2;
        let eeY = influenceeY + influenceeHeight / 2;
        if (!tempLine) {
            const edgeEE = util.determineEdgePoint({
                eeX,
                eeY,
                erX,
                erY,
                eeWidth: influenceeWidth,
                eeHeight: influenceeHeight
            });
            eeX = edgeEE.x;
            eeY = edgeEE.y;
            
            const edgeEr = util.determineEdgePoint({
                eeX : erX,
                eeY: erY,
                erX: eeX,
                erY: eeY,
                eeWidth: influencerWidth,
                eeHeight: influencerHeight
            });
            erX  = edgeEr.x;
            erY  = edgeEr.y;
        } else {
            erX = influencerX + influencerWidth;
            erY = influencerY + influencerHeight;
            eeX = influenceeX + influencerWidth;
            eeY = influenceeY + influencerHeight;
        }
        
        // const svgClasses = classnames('Relationship__svg', {
        //     'Relationship__svg--negative': influence < 0,
        //     'Relationship__svg--positive': influence > 0,
        //     'Relationship__svg--neutral': influence === 0,
        //     'Relationship__svg--selected': selected 
        // });
        
        const negative = influence < 0;
        let influenceModifier = selected ? 'selected' : 'neutral';
        let color = selected ? '#83A603' : '#333';
        if (!selected && influence !== 0) {
            color = negative ? '#BF5513' : '#0351A6';
            influenceModifier = negative ? 'negative' : 'positive';
        }

        const rootClassname = classnames('Relationship', {
            [className]: !!className,
            'Relationship--has-temp-relationship' : hasTempRelationship
        });
        // console.log('rootClassname:', rootClassname);
        return (
            <span className={rootClassname}>
                {lineThickness > 1 &&
                    <svg
                        className="Relationship__svg Relationship__svg--bg"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <line
                            x1={erX}
                            x2={eeX}
                            y1={erY}
                            y2={eeY}
                            stroke={color}
                            strokeWidth={lineThickness * 3}
                            opacity={0.3}
                        />
                    </svg>
                }
                <svg
                    className="Relationship__svg Relationship__svg--line"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line
                        x1={erX}
                        x2={eeX}
                        y1={erY}
                        y2={eeY}
                        stroke={color}
                        strokeWidth={tempLine ? 2 : lineThickness}
                    />
                </svg>
                <svg
                    className="Relationship__svg Relationship__svg--hit"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={this.onClick}
                >   
                    <defs>
                        <marker
                            id="arrow-neutral"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#333'}
                            />
                        </marker>
                        <marker
                            id="arrow-negative"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#BF5513'}
                            />
                        </marker>
                        <marker
                            id="arrow-positive"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#0351A6'}
                            />
                        </marker>
                        <marker
                            id="arrow-selected"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#83A603'}
                            />
                        </marker>
                    </defs>
                    <line
                        x1={erX}
                        x2={eeX}
                        y1={erY}
                        y2={eeY}
                        stroke="transparent"
                        strokeWidth="10"
                        markerEnd={`url(#arrow-${influenceModifier})`}
                    />
                </svg>
                {!tempLine && 
                    <RelationshipValueDisplay
                        erX={erX}
                        eeX={eeX}
                        erY={erY}
                        eeY={eeY}
                        influence={influence}
                    />
                }
            </span>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        relationshipFocus: (influencerId, influenceeId) => {
            dispatch(relationshipFocus(influencerId, influenceeId))
        }
    };
}

export default connect(null, mapDispatchToProps)(Relationship);
