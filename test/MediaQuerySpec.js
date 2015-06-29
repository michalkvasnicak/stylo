/**
 * @author Michal Kvasničák <michal.kvasnicak@mink.sk>
 * @copyright Mink, ltd 2015
 */

import { expect } from "chai";
import MediaQuery from "../src/MediaQuery";

describe("MediaQuery", () => {
    "use strict";

    describe("#constructor", () => {

        it("throws error if sub rule definitions are not objects", () => {
            expect(
                () => new MediaQuery("@media all", { default: null })
            ).to.throw(/.*Rule `default` is invalid, object expected but null given/);
        });

    });

    describe("#toString()", () => {

        it("returns empty media query rule if no sub rules are defined", () => {
            const query = new MediaQuery("@media all");

            expect(query.toString(".className")).to.be.equal("@media all{}");
        });

        it("returns media query rule with defined sub rules", () => {
            const query = new MediaQuery("@media all", {
                default: {
                    fontSize: "10px"
                },
                ":hover": {
                    color: "#000"
                },
                "::before": {
                    content: '"pom"'
                },
                "@keyframes resize": {
                    "0%": {
                        height: "100%"
                    },
                    "100%": {
                        height: "0%"
                    }
                }
            });

            expect(query.toString(".className")).to.be.equal(
                "@media all{"
                    + ".className{font-size:10px}.className:hover{color:#000}.className::before{content:\"pom\"}"
                    + "@keyframes resize{0%{height:100%}100%{height:0%}}"
                + "}"
            );
        });

    });
});
