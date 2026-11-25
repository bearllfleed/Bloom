import { partMatrix, type SvgMatrix } from '@/ui/motion/matrix';

function apply(m: SvgMatrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

function expectPoint(actual: [number, number], expected: [number, number]) {
  expect(actual[0]).toBeCloseTo(expected[0], 6);
  expect(actual[1]).toBeCloseTo(expected[1], 6);
}

describe('partMatrix', () => {
  it('不变换时是单位矩阵', () => {
    const m = partMatrix(12, 34, {});
    [1, 0, 0, 1, 0, 0].forEach((v, i) => expect(m[i]).toBeCloseTo(v, 6));
  });

  it('旋转、缩放时原点不动', () => {
    expectPoint(apply(partMatrix(20, 30, { rotate: 37, scale: 1.3 }), 20, 30), [20, 30]);
  });

  it('顺时针旋转 90°', () => {
    expectPoint(apply(partMatrix(10, 10, { rotate: 90 }), 20, 10), [10, 20]);
  });

  it('绕原点缩放，scaleX / scaleY 覆盖 scale', () => {
    expectPoint(apply(partMatrix(10, 10, { scale: 2 }), 12, 10), [14, 10]);
    expectPoint(apply(partMatrix(10, 10, { scale: 2, scaleY: 0.5 }), 12, 14), [14, 12]);
  });

  it('先绕原点变换，再平移', () => {
    expectPoint(apply(partMatrix(10, 10, { rotate: 90, translateX: 3, translateY: -2 }), 20, 10), [13, 18]);
  });
});
