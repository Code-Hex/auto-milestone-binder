import { existsMilestone } from '../src/main'

describe('existsMilestone', () => {
  // https://jestjs.io/docs/en/api#1-testeachtablename-fn-timeout
  test.each([
    [true, {issue:{number:0,milestone:{}}}],
    [true, {pull_request:{number: 0,milestone:{}}}],
    [false, {issue:{number:0}}],
    [false, {pull_request:{number: 0}}]
  ])("expected '%p', argument: %o", (want, arg) => {
    expect(existsMilestone(arg)).toBe(want)
  })
});