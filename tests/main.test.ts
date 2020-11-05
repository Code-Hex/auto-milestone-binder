import { existsMilestone, pickLatestSprint } from '../src/main'

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

const makeMilestone = (title: string, number: number): {title:string,number:number} => {
  return {
    title: title,
    number: number,
  }
}

describe('pickLatestSprint', () => {
  test.each([
    [2, {
      data: [
        makeMilestone('Sprint 1', 4),
        makeMilestone('Sprint 2', 3),
        makeMilestone('Sprint 3', 1),
        makeMilestone('Sprint 4', 2),
      ]
    }],
    [4, {
      data: [
        makeMilestone('Sprint 1', 1),
        makeMilestone('Hello World', 3),
        makeMilestone('Sprint 2', 4),
        makeMilestone('codehex', 2),
      ]
    }],
  ])("expected '%p', argument: %o", (want, arg) => {
    const got = pickLatestSprint(arg)
    expect(got?.number).toBe(want)
  })
})