var should = require('should');

describe('vote app test', function () {
    it('should return blue as 1 when we receive one blue vote', function () {
        var blue = 1;
        blue.should.equal(1);
    });
});