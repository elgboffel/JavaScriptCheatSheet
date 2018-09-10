import React, { Component } from 'react';
import "./AccordionItem.scss";
import PropTypes from 'prop-types';

class AccordionItem extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        children: PropTypes.any,
        activate: PropTypes.func,
        index: PropTypes.number,
        isActive: PropTypes.bool
    }

    render() {
        return (
            <div className={`accordion__item ${this.props.isActive ? "accordion__item--active" : ""}`}>
                <button onClick={() => this.props.activate(this.props.index)} className="accordion__trigger" role="tab">
                    <span className="accordion__title">{this.props.title}</span>
                </button>
                <div role="tabpanel" className="accordion__content">
                    <div className="accordion__body">{this.props.children}</div>
                </div>
            </div>
        );
    }
}

export default AccordionItem;
