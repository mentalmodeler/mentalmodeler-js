import React, { Component } from 'react';
import { connect } from 'react-redux';
// import {
//     conceptMove,
//     conceptFocus
// } from '../../actions/index';
import classnames from 'classnames';
import './Relationship.css';

class Relationship extends Component {
    constructor(props) {
        super(props);

        console.log(this.props.comboId, '\nthis.props:', this.props, '\n\n');
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
            influencerId,
            influencerX,
            influencerY,
            influenceeId,
            influenceeX,
            influenceeY,
            influence
        } = this.props

        const influenceAbsValue = Math.abs(influence);
        const lineThickness = Math.round(influenceAbsValue * 3 + 1);

        const svgClasses = classnames('Relationship__svg', {
            'Relationship__svg--negative': influence < 0,
            'Relationship__svg--positive': influence > 0 
        });
        
        const stroke = influence < 0
            ? '#BF5513'
            : '#0351A6';


        // console.log('\n', comboId, '\n\tinfluenceAbsValue:', influenceAbsValue, ', lineThickness:', lineThickness);

        return (
            <span className="Relationship">
                <svg
                    className="Relationship__svg Relationship__svg--hit"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={this.onClick}
                >
                    <line
                        x1={influencerX}
                        x2={influenceeX}
                        y1={influencerY}
                        y2={influenceeY}
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
                            x1={influencerX}
                            x2={influenceeX}
                            y1={influencerY}
                            y2={influenceeY}
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
                        x1={influencerX}
                        x2={influenceeX}
                        y1={influencerY}
                        y2={influenceeY}
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
