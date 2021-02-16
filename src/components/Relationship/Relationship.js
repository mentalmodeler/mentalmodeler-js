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
    constructor(props) {
        super(props);

        this.state = {
            justMounted: false
        };        
    }

    componentDidMount() {
        if (this.props.selected) {
            this.setState({
                justMounted: true
            });
        }
    }

    componentDidUpdate() {
        if (this.state.justMounted) {
            this.setState({
                justMounted: false
            });
        }
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        const shouldUpdate = [
            nextProps.influenceeX !== this.props.influenceeX,
            nextProps.influenceeY !== this.props.influenceeY,
            nextProps.influenceeWidth !== this.props.influenceeWidth,
            nextProps.influenceeHeight !== this.props.influenceeHeight,
            nextProps.influencerX !== this.props.influencerX,
            nextProps.influencerY !== this.props.influencerY,
            nextProps.influencerWidth !== this.props.influencerWidth,
            nextProps.influencerHeight !== this.props.influencerHeight,
            nextProps.selected !== this.props.selected,
            nextProps.tempLine !== this.props.tempLine,
            nextProps.hasTempRelationship !== this.props.hasTempRelationship,
            nextProps.inDualRelationship !== this.props.inDualRelationship,
            nextProps.isExcludedByFilter !== this.props.isExcludedByFilter,
            nextProps.influence !== this.props.influence,
            nextState.justMounted === true && this.state.justMounted === false
        ].some((cond) => (!!cond));
        return shouldUpdate;
    }

    setRef = (ref) => {
        this.root = ref;
    }

    onClick = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        relationshipFocus(influencerId, influenceeId);
    }

    render() {
        const {
            influence,
            influenceeId,
            influenceeX,
            influenceeY,
            influenceeWidth,
            influenceeHeight,
            influencerId,
            influencerX,
            influencerY,
            influencerWidth,
            influencerHeight,
            centerClickDiffX,
            centerClickDiffY,
            selected,
            className,
            tempLine,
            hasTempRelationship,
            inDualRelationship,
            isFirstInDualRelationship,
            isExcludedByFilter
        } = this.props

        // console.log('Relationship > render >', influencerId, '-', influenceeId, '\n\tinDualRelationship:', inDualRelationship, ', isFirstInDualRelationship:', isFirstInDualRelationship);
        const sizeData = [influenceeWidth, influenceeHeight, influencerWidth, influencerHeight];
        const missingSomeSizeData = sizeData.some((value) => (!value));
        const selfRelationship = !tempLine && influencerId === influenceeId;
        if (missingSomeSizeData && !tempLine) {
            return null;
        }

        const influenceAbsValue = Math.abs(influence);
        const lineThickness = Math.round(influenceAbsValue * 3 + 1);
        let erX = influencerX + influencerWidth / 2 + util.getOffset(inDualRelationship, isFirstInDualRelationship);
        let erY = influencerY + influencerHeight / 2;
        let eeX = influenceeX + influenceeWidth / 2 + util.getOffset(inDualRelationship, isFirstInDualRelationship);
        let eeY = influenceeY + influenceeHeight / 2;
        let path = '';
        const selfRelationshipAdj = 16;
        const radiusX = 22;
        const radiusY = 22;
        const startX = influencerX + influencerWidth - selfRelationshipAdj;
        const startY = influencerY + influencerHeight;
        const endX = influencerX + influencerWidth;
        const endY = influencerY + influencerHeight - selfRelationshipAdj;
        if (selfRelationship) {
            path = `M${startX},${startY} A ${radiusX} ${radiusY} 0 1 0 ${endX + 16},${endY} L${endX},${endY}`;
        }
        if (!tempLine && !selfRelationship) {
            const edgeEE = util.determineEdgePoint({
                eeX,
                eeY,
                erX,
                erY,
                eeWidth: influenceeWidth,
                eeHeight: influenceeHeight,
                inDualRelationship,
                isFirstInDualRelationship
            });
            eeX = edgeEE.x;
            eeY = edgeEE.y;
            
            const edgeEr = util.determineEdgePoint({
                eeX : erX,
                eeY: erY,
                erX: eeX,
                erY: eeY,
                eeWidth: influencerWidth,
                eeHeight: influencerHeight,
                inDualRelationship,
                isFirstInDualRelationship
            });
            erX  = edgeEr.x;
            erY  = edgeEr.y;
        } else {
            erX = influencerX;
            erY = influencerY;
            eeX = influenceeX + centerClickDiffX;
            eeY = influenceeY + centerClickDiffY;
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
            'Relationship--has-temp-relationship': hasTempRelationship,
            'Relationship--excluded-by-filter': isExcludedByFilter,
            'Relationship--temp-line' : tempLine
        });
        // console.log('rootClassname:', rootClassname);
        // if ([isNaN(erX), isNaN(erY), isNaN(eeX), isNaN(eeY)].some((conditon) => (!!conditon))) {
        if (isNaN(erX)) {
            return  <span className={rootClassname}></span>
        }
        return (
            <span className={rootClassname}>
                {lineThickness > 1 &&
                    <svg
                        className="Relationship__svg Relationship__svg--bg"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            stroke: `${color}`,
                            opacity: '0.3'
                        }}
                    >
                        {!selfRelationship && (
                            <line
                                x1={erX}
                                x2={eeX}
                                y1={erY}
                                y2={eeY}
                                strokeWidth={lineThickness * 3}
                            />
                        )}
                        {selfRelationship && (
                            <path
                                fill="none"
                                strokeWidth={lineThickness * 3}
                                d={path}
                            />
                        )}
                    </svg>
                }
                <svg
                    className="Relationship__svg Relationship__svg--line"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {!selfRelationship && (
                        <line
                            x1={erX}
                            x2={eeX}
                            y1={erY}
                            y2={eeY}
                            stroke={color}
                            strokeWidth={tempLine ? 2 : lineThickness}
                        />
                    )}
                    {selfRelationship && (
                        <path
                            fill="none"
                            stroke={color}
                            strokeWidth={tempLine ? 2 : lineThickness}
                            d={path}
                        />
                    )}
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
                    {!selfRelationship && (
                        <line
                            x1={erX}
                            x2={eeX}
                            y1={erY}
                            y2={eeY}
                            stroke="transparent"
                            strokeWidth="10"
                            markerEnd={`url(#arrow-${influenceModifier})`}
                        />
                    )}
                    {selfRelationship && (
                        <path
                            fill="none"
                            stroke="transparent"
                            strokeWidth="10"
                            markerEnd={`url(#arrow-${influenceModifier})`}
                            d={path}
                        />
                    )}
                </svg>
                {!tempLine && 
                    <RelationshipValueDisplay
                        erX={erX}
                        eeX={eeX}
                        erY={erY}
                        eeY={eeY}
                        selfRelationship={selfRelationship}
                        selfRelationshipX={influencerX + influencerWidth}
                        selfRelationshipY={influencerY + influencerHeight}
                        influencerId={influencerId}
                        influenceeId={influenceeId}
                        influence={influence}
                        expanded={this.state.justMounted}
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
