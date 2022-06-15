declare module 'chi-squared-test' {
  interface ResultsSet {
    chiSquared: number
    probability: number
    terms: number[]
  }
  function chiSquaredTest(observations: number[], expectations: number[], degreesOfFreedomReduction: number): ResultsSet
  export = chiSquaredTest
}
