import React, { Component } from 'react';
import { connect } from 'react-redux';
import Concept from '../Concept/Concept';


class Concepts extends Component {
    render() {
        return (
            <div>
            {this.props.concepts.map((concept, index) => (
                <Concept
                    key={`concept_${index}`}
                    {...concept}
                />
            ))}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        concepts: state.concepts
    };
}

export default connect(mapStateToProps)(Concepts);