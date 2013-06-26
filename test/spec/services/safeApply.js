'use strict';

describe('Service: safeApply', function () {

  // load the service's module
  beforeEach(module('vnbidding.github.ioApp'));

  // instantiate service
  var safeApply;
  beforeEach(inject(function (_safeApply_) {
    safeApply = _safeApply_;
  }));

  it('should do something', function () {
    expect(!!safeApply).toBe(true);
  });

});
