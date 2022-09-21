describe("galois", () => {
  it("should generate the correct generator polynomials", () => {
    // test some assumptions we think we know about the specific galois field library we're reverse engineering
    // we'll try to use the red-agate-math library to regenerate the constant arrays we have and the results it makes
    // /**
    //  * list generator polynomials.
    //  *
    //  * generator polynominal that correct (n-1)/2 places of error is:
    //  * G(X) = (x-a^0)(x-a^1) ... (x-a^n)
    //  */
    // const listGx = function<F>(field: FiniteField<F>, nth: number, aDegree = 0): F[][] {
    //     const poly = new ArrayPolynomialRing(field);
    //     const gxs: F[][] = [];
    //     let   u: F[] = [field.exp(aDegree), field.ONE];
    //     const v: F[] = [field.exp(aDegree + 1), field.ONE];
    //     if (gxs.length === 0) {
    //         gxs.push(u);
    //     } else {
    //         u = gxs[gxs.length - 1];
    //         v[0] = field.exp(aDegree + gxs.length);
    //     }
    //     for (let i = gxs.length + 1; i <= nth; i++) {
    //         u = poly.mul(u, v);
    //         gxs.push(u);
    //         v[0] = field.exp(aDegree + i);
    //     }
    //     return gxs;
    // }
  });
});
