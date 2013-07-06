'use strict';

describe('Service: biddingConfig', function () {

  // load the service's module
  beforeEach(module('vnbidding.github.ioApp'));

  // instantiate service
  var biddingConfig;
  beforeEach(inject(function (_biddingConfig_) {
    biddingConfig = _biddingConfig_;
  }));

  it('should do something', function () {
    expect(!!biddingConfig).toBe(true);
  });

});
