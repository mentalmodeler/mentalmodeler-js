import React, { Component } from 'react';
import { connect } from 'react-redux';
import Concept from '../Concept/Concept';


class Concepts extends Component {
    render() {
        console.log('this.props.concepts:', this.props.concepts);
        return this.props.concepts.map((concept, index) => (
            <Concept
                key={`comcept_${index}`}
                {...concept}
            />
        ));
    }
}

const mapStateToProps = (state) => {
    return {
        concepts: state.concepts
    };
}

export default connect(mapStateToProps)(Concepts);