import React, { Component } from 'react';
import PropTypes from 'prop-types';
import splitter from "../../utils/splitter";
import "./CookiePolicy.scss";

/**
 * @example: 
 *  <CookiePolicy type="line|fullbox|box" position="top|bottom|top right...">
 *      Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
 *  </CookiePolicy>
 * 
 *  <CookiePolicy type="line" position="bottom" link="/cookie-dude" linkText="Read more here" buttonText="Nå">
 *      Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
 *  </CookiePolicy>
 */


class CookiePolicy extends Component {
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 
            ? parts.pop().split(";")
                .shift() 
            : undefined;
    }
    
    setCookie(name, value, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }



    static propTypes = {
        cssClass: PropTypes.string,
        buttonText: PropTypes.string,
        link: PropTypes.string,
        linkText: PropTypes.string,
        position: PropTypes.oneOf(["top", "bottom", "top left", "top right", "bottom left", "bottom right"]).isRequired,
        type: PropTypes.oneOf(["line", "fullbox", "box"]).isRequired,
        children: PropTypes.string
    }

    static defaultProps = {
        buttonText: "OK",
        linkText: "Learn More Here"
    }

    defaults = {
        cookieName: "cookiepolicy",
        exdays: 365
    }


    constructor(props) {
        super(props);
        this.state = { 
            isActive: this.getCookie(this.defaults.cookieName) === undefined
        };
    }


    onClick() {
        this.setCookie(this.defaults.cookieName, "true", this.defaults.exdays);
        this.setState({
            isActive: false
        });
    }

    get positionClasses() {
        const positions = [];
        splitter(this.props.position, position => {
            positions.push(`cookiepolicy--${position}`);
        });

        return positions.join(" ");
    }

    render() {
        return (
            <React.Fragment>
                {this.state.isActive && (
                    <div className={`cookiepolicy ${this.props.cssClass} ${this.state.isActive ? "cookiepolicy--active" : ""} cookiepolicy--${this.props.type} ${this.positionClasses}`}>
                        <div className="wrapper">
                            <div className="cookiepolicy__actions">
                                <button className="cookiepolicy__clear" onClick={() => this.onClick()}>{this.props.buttonText}</button>
                                {this.props.link && this.props.buttonText && (
                                    <a href={this.props.link}>{this.props.linkText}</a>
                                )}
                            </div>
                            <p>{this.props.children}</p>
                        </div>
                    </div>
                )} 
            </React.Fragment>
        );
    }
}

export default CookiePolicy;
