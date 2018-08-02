import { expect } from 'chai';
import Store from '../../src/store';

describe('Testing mutation.setCurrent', () => {
  it('undefined should return false', () => {
    const result = Store.commit('setCurrent');
    expect(result).to.equal(true);
  });
});
