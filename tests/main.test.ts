import {existsMilestone, pickSmallestVersion} from '../src/main';

describe('existsMilestone', () => {
  // https://jestjs.io/docs/en/api#1-testeachtablename-fn-timeout
  test.each([
    [true, {issue: {number: 0, milestone: {}}}],
    [true, {pull_request: {number: 0, milestone: {}}}],
    [false, {issue: {number: 0}}],
    [false, {pull_request: {number: 0}}]
  ])("expected '%p', argument: %o", (want, arg) => {
    expect(existsMilestone(arg)).toBe(want);
  });
});

const makeMilestone = (
  title: string,
  number: number
): {title: string; number: number} => {
  return {
    title: title,
    number: number
  };
};

describe('pickSmallestVersion', () => {
  test.each([
    [
      1,
      {
        data: [
          makeMilestone('v1.0.2', 4),
          makeMilestone('v1.1.0', 3),
          makeMilestone('v1.0.0', 1),
          makeMilestone('v1.0.1', 2)
        ]
      }
    ],
    [
      1,
      {
        data: [
          makeMilestone('v1.0.0', 1),
          makeMilestone('Hello World', 3),
          makeMilestone('v1.0.2', 4),
          makeMilestone('codehex', 2)
        ]
      }
    ]
  ])("expected '%p', argument: %o", (want, arg) => {
    const got = pickSmallestVersion(arg);
    expect(got.number).toBe(want);
  });
});
