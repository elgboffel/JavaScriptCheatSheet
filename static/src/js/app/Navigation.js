import React from "react";
import { Link } from 'react-router-dom';

const Navigation = () => (
    <nav>
        <Link to="/cookie-policy">Cookie Policy</Link>
        <Link to="/accordion">Accordion</Link>
    </nav>
);

export default Navigation;
