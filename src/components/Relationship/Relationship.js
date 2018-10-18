import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import './Relationship.css';

class Relationship extends Component {
    constructor(props) {
        super(props);
    }

    onComponentDidMount() {

    }

    setRef = (ref) => {
        this.root = ref;
    }

    onClick = (e) => {
        const {comboId, influence} = this.props;
        console.log(comboId, '> click, influence:', influence);
    }

    getSVGClass() {
        const {influence} = this.props;
    }

    render() {
        const {
            comboId,
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
            influencerHeight
        } = this.props
        
        const sizeData = [influenceeWidth, influenceeHeight, influencerWidth, influencerHeight];
        const missingSomeSizeData = sizeData.some((value) => (!value));
        if (missingSomeSizeData) {
            return null;
        }

        const influenceAbsValue = Math.abs(influence);
        const lineThickness = Math.round(influenceAbsValue * 3 + 1);
        const erX = influencerX + influencerWidth / 2;
        const erY = influencerY + influencerHeight / 2;
        const eeX = influenceeX + influenceeWidth / 2;
        const eeY = influenceeY + influenceeHeight / 2;

        const svgClasses = classnames('Relationship__svg', {
            'Relationship__svg--negative': influence < 0,
            'Relationship__svg--positive': influence > 0 
        });
        
        const stroke = influence < 0
            ? '#BF5513'
            : '#0351A6';


        console.log('\n', comboId, '\n\tinfluenceAbsValue:', influenceAbsValue, ', lineThickness:', lineThickness);

        return (
            <span className="Relationship">
                <svg
                    className="Relationship__svg Relationship__svg--hit"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={this.onClick}
                >
                    <line
                        x1={erX}
                        x2={eeX}
                        y1={erY}
                        y2={eeY}
                        stroke="transparent"
                        strokeWidth="10"
                    />
                </svg>
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
                            stroke={stroke}
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
                        stroke={stroke}
                        strokeWidth={lineThickness}
                    />
                </svg>
            </span>
        );
    }
}

// const mapDispatchToProps = (dispatch) => {
//     return {
//         conceptMove: (id, x, y) => {
//             dispatch(conceptMove(id, x, y))
//         },

//         conceptFocus: (id) => {
//             dispatch(conceptFocus(id))
//         }
//     };
// }
// export default connect(null, mapDispatchToProps)(Relationship);
export default Relationship;
