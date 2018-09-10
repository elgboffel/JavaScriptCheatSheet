import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Accordion extends Component {

    static propTypes = {
        children: PropTypes.any
    }

    constructor(props) {
        super(props);
        this.state = {
            isActivated: false,
            activeChild: undefined
        };
    }

    activate(index) {
        if (index === this.state.activeChild) {
            this.setState({ activeChild: undefined });
        } else {
            this.setState({ activeChild: index });
        }
    }

    setChildProps(child, index) {
        return React.cloneElement(child, {
            activate: this.activate.bind(this),
            isActive: typeof this.state.activeChild !== "undefined" ? this.state.activeChild === index : false,
            index
        });
    }

    render() {
        return (
            <div className="accordion">
                {React.Children.map(this.props.children, (child, index) =>
                    this.setChildProps(child, index)
                )}
            </div>
        );
    }

}

export default Accordion;
