import React, { Component } from 'react';
import classnames from 'classnames';

import './Controls.css';

const arrowheadHeight = 12;
const arrowheadWidth = 10;
        
class Control extends Component {
    constructor(props) {
        super(props);

        this.state =({
            isOpen: true
        });
    }

    // getStyle() {
    //     const style = {};
    //     ['flexGrow', 'flexShrink', 'minHeight', 'maxHeight'].forEach((key) => {
    //         if (typeof this.props[key] !== 'undefined') {
    //             style[key] = this.props[key];
    //         }
    //     });
    //     return style;
    // }

    getBodyStyle() {
        const {isOpen} = this.state;
        const style = {
            maxHeight: isOpen ? '100vh' : '0', // isOpen ? '100vh' : '0'
        };

        if (!isOpen) {
            style.overflow = 'hidden';
        }

        return style;
    }

    getHeaderIconStyle() {
        const {isOpen} = this.state
        const style = {};
        
        if (isOpen) {
            style.transform = 'rotate(90deg)'
        }

        return style;
    }

    onHeaderClick = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        const {isOpen} = this.state;
        const rootClasses = classnames('control-panel', {
            [this.props.className]: !!this.props.className,
            'control-panel--open': isOpen,
            'control-panel--closed': !isOpen
        });
        return (
            <div className={rootClasses} >
                <div className="control-panel__header"
                    onClick={this.onHeaderClick}
                >
                <span className="control-panel__header-icon">
                    <svg
                        className="control-panel__header-icon-svg"
                        style={this.getHeaderIconStyle()}
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        height={`${arrowheadHeight}px`}
                        width={`${arrowheadWidth}px`}
                        viewBox={`0 0 ${arrowheadWidth} ${arrowheadHeight}`}
                    >
                        <path
                            d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                        />
                        </svg> 
                </span>    
                <span className="control-panel__header-text">{this.props.title}</span>
                </div>
                <div className={`control-panel__body control-panel__body--${isOpen ? 'in' : 'out'}`} style={this.getBodyStyle()}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Control;
