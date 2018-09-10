import React from "react";
import { CookiePolicy } from "../../react-modules";

const CookiePolicyExample = () => (
    <div>
        <h1>Cookie Policy Example</h1>
        <CookiePolicy type="line" position="top" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="line" position="bottom" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="fullbox" position="top" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="fullbox" position="bottom" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="box" position="top left" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="box" position="top right" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="box" position="bottom left" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
        <CookiePolicy type="box" position="bottom right" link="#">
            Line Top - We use cookies to give you the best online experience. By using our website you agree to our use of cookies in accordance with our cookie policy.
        </CookiePolicy>
    </div>
);

export default CookiePolicyExample;
