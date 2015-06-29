/**
 * @author Michal Kvasničák <michal.kvasnicak@mink.sk>
 * @copyright Mink, ltd 2015
 */

import { expect } from "chai";
import Rule from "../src/Rule";

describe("Rule", () => {
    "use strict";

    describe("#toString()", () => {

        it("returns empty string if rule does not contain any properties", () => {
            const rule = new Rule();

            expect(rule.toString(".className")).to.be.equal(".className{}");
        });

        it("returns CSS class rule from properties", () => {
            const rule = new Rule({ backgroundColor: "#000", fontSize: "10px", padding: "1px" });

            expect(rule.toString(".className")).to.be.equal(
                ".className{background-color:#000;font-size:10px;padding:1px}"
            );
        });

        it("returns CSS class rule for default pseudo selector from properties", () => {
            const rule = new Rule("default", { backgroundColor: "#000", fontSize: "10px", padding: "1px" });

            expect(rule.toString(".className")).to.be.equal(
                ".className{background-color:#000;font-size:10px;padding:1px}"
            );
        });

        it("returns CSS class rule with pseudo selector", () => {
            const rule = new Rule(":hover", { backgroundColor: "#000", fontSize: "10px", padding: "1px" });

            expect(rule.toString(".className")).to.be.equal(
                ".className:hover{background-color:#000;font-size:10px;padding:1px}"
            );
        });

    });
});
