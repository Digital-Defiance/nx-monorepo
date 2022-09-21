import * as secrets from 'secrets.js-34r7h';

export function test() {
  // using shamir's secret sharing to split a secret into shares
  // we will create an encrypted quorum where one can store data and require a majority of the quorum to decrypt it
  // generate a 512-bit key
  const key = secrets.random(512); // => key is a hex string

  // split into 10 shares with a threshold of 5
  const shares = secrets.share(key, 10, 5);
  // => shares = ['801xxx...xxx','802xxx...xxx','803xxx...xxx','804xxx...xxx','805xxx...xxx']

  // combine 4 shares
  let comb = secrets.combine(shares.slice(0, 4));
  console.log(comb === key); // => false

  // combine 5 shares
  comb = secrets.combine(shares.slice(4, 9));
  console.log(comb === key); // => true

  // combine ALL shares
  comb = secrets.combine(shares);
  console.log(comb === key); // => true

  // create another share with id 8
  const newShare = secrets.newShare(8, shares); // => newShare = '808xxx...xxx'

  // reconstruct using 4 original shares and the new share:
  comb = secrets.combine(shares.slice(1, 5).concat(newShare));
  console.log(comb === key); // => true
}
