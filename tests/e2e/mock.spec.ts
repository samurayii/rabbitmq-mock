import { expect } from "chai";
import fetch from "node-fetch";

describe("Mock", function () {

    const mock_name = "mock1";

    it("exist", async () => {

        const response = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/exist`);

        expect(response.status).to.equal(200);

        const response_data = await response.json();

        expect(response_data).to.be.an("object");
        expect(response_data.status).equal("success");
        expect(response_data.data).to.be.an("boolean");
        expect(response_data.data).equal(true);

    });

    it("info", async () => {

        const response = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/info`);

        expect(response.status).to.equal(200);

        const response_data = await response.json();

        expect(response_data).to.be.an("object");
        expect(response_data.status).equal("success");
        expect(response_data.data).to.be.an("object");

    });

    it("handlers", async () => {

        const response = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/handlers`);

        expect(response.status).to.equal(200);

        const response_data = await response.json();

        expect(response_data).to.be.an("object");
        expect(response_data.status).equal("success");
        expect(response_data.data).to.be.an("array");
        expect(response_data.data.length).equal(2);

    });

    it("state", async () => {

        const response = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/state`);

        expect(response.status).to.equal(200);

        const response_data = await response.json();

        expect(response_data).to.be.an("object");
        expect(response_data.status).equal("success");
        expect(response_data.data).to.be.an("object");

    });

    it("reset", async () => {

        const response = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/reset`);

        expect(response.status).to.equal(200);

        const response_data = await response.json();

        expect(response_data).to.be.an("object");
        expect(response_data.status).equal("success");
        expect(response_data.data).to.be.an("object");

    });

    it("set state", async () => {

        type TBody = {
            [key: string]: string
        }

        const body: TBody = {
            ffff1: "test1",
            ffff2: "test2"
        };

        const response1 = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/state/change`, {
            method: "post",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        });

        expect(response1.status).to.equal(200);

        const response1_data = await response1.json();

        expect(response1_data).to.be.an("object");
        expect(response1_data.status).equal("success");
        expect(response1_data.data).to.be.an("object");

        for (const key in body) {
            expect(response1_data.data[key]).equal(body[key]);
        }

        const response2 = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/reset`);

        expect(response2.status).to.equal(200);

        const response2_data = await response2.json();

        expect(response2_data).to.be.an("object");
        expect(response2_data.status).equal("success");
        expect(response2_data.data).to.be.an("object");

        for (const key in body) {
            expect(response2_data.data[key]).equal(undefined);
        }

    });

    it("delete state", async () => {

        type TBody = {
            [key: string]: string
        }

        const body: TBody = {
            ffff1: "test1",
            ffff2: "test2"
        };

        const response1 = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/state/change`, {
            method: "post",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        });

        const response1_data = await response1.json();

        for (const key in body) {
            expect(response1_data.data[key]).equal(body[key]);
        }

        const response2 = await fetch(`http://localhost:3001/api/v1/mock/${mock_name}/state/delete`, {
            method: "post",
            body: JSON.stringify(Object.keys(body)),
            headers: { "Content-Type": "application/json" }
        });

        expect(response2.status).to.equal(200);

        const response2_data = await response2.json();

        expect(response1_data).to.be.an("object");
        expect(response1_data.status).equal("success");
        expect(response1_data.data).to.be.an("object");

        for (const key in body) {
            expect(response2_data.data[key]).equal(undefined);
        }

    });

});