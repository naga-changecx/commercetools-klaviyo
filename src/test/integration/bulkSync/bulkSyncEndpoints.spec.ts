import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import http from "http";
import { bulkSyncApp } from "../../../infrastructure/driving/adapter/bulkSync/bulkSyncApiAdapter";
import nock from 'nock';
import { ctAuthNock } from '../nocks/commercetoolsNock'

chai.use(chaiHttp);

describe('bulkSyncApp order sync endpoint', () => {
  let server: http.Server;
  beforeEach(() => {
    server = bulkSyncApp.listen(0);
  });

  afterEach(async () => {
    nock.cleanAll();
    await server.close();
  });

  it('should accept the request and return 202',  (done) => {
    ctAuthNock(4);
    chai.request(server)
      .post('/sync/orders')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.eq(202);
        done();
      });
  });
});

describe('bulkSyncApp customer sync endpoint', () => {
  let server: http.Server;
  beforeEach(() => {
    server = bulkSyncApp.listen(0);
  });

  afterEach(async () => {
    nock.cleanAll();
    await server.close();
  });

  it('should accept the request and return 202',  (done) => {
    ctAuthNock(4);
    chai.request(server)
      .post('/sync/customers')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.eq(202);
        done();
      });
  });
});

