import { expect } from "chai";
import fetch from "node-fetch";

describe("Mocks", function () {

    it("list", async () => {

        const response = await fetch("http://localhost:3001/api/v1/mocks/");

        expect(response.status).to.equal(200);

        const response_data = await response.json();

        expect(response_data).to.be.an("object");
        expect(response_data.status).equal("success");
        expect(response_data.data).to.be.an("array");
        expect(response_data.data.length).equal(1);

    });

});