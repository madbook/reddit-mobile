import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

var expect = chai.expect;

chai.use(sinonChai);

import short from '../../src/lib/formatDifference';

describe('lib: formatDifference', () => {
	it('is a function', () => {
		expect(short).to.be.a('function');
	});

	var min = 60 * 1000;
	var hour = min * 60;
	var day = hour * 24;

	var date = Date.now();
	
	it('returns the delta time with a single letter abbreviated unit', () => {
		var dayAgo = date - day;
		expect(short(dayAgo)).to.equal('1d');

		var hourAgo = date - hour;
		expect(short(hourAgo)).to.equal('1h');

		var minAgo = date - min;
		expect(short(minAgo)).to.equal('1m');
	});
});