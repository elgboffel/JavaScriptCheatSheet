import React from "react";
import { Switch, Route } from 'react-router-dom';
import Frontpage from "./Pages/Frontpage";
import CookiePolicyExample from "./Pages/CookiePolicyExample";
import AccordionExample from "./Pages/AccordionExample";

const Content = () => (
    <Switch>
        <Route exact path="/" component={Frontpage}/>
        <Route path="/cookie-policy" component={CookiePolicyExample}/>
        <Route path="/accordion" component={AccordionExample}/>
    </Switch>
);

export default Content;
