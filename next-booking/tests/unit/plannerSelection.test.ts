import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  getCommonRangeAcrossResources,
  getContinuousRanges,
  makeTimeCellKey,
  usePlannerSelection
} from '../../hooks/usePlannerSelection';

describe('planner selection helpers', () => {
  it('computes continuous ranges for a resource', () => {
    const selection = {
      [makeTimeCellKey(1, 12)]: true,
      [makeTimeCellKey(1, 13)]: true,
      [makeTimeCellKey(1, 14)]: true
    };

    const ranges = getContinuousRanges(selection, 1);
    expect(ranges).toEqual([{ startHour: 12, endHour: 15 }]);
  });

  it('returns common range across multiple resources when aligned', () => {
    const selection = {
      [makeTimeCellKey(1, 12)]: true,
      [makeTimeCellKey(1, 13)]: true,
      [makeTimeCellKey(2, 12)]: true,
      [makeTimeCellKey(2, 13)]: true
    };

    const range = getCommonRangeAcrossResources(selection, [1, 2]);
    expect(range).toEqual({ startHour: 12, endHour: 14 });
  });

  it('returns null for common range when hours differ', () => {
    const selection = {
      [makeTimeCellKey(1, 12)]: true,
      [makeTimeCellKey(2, 13)]: true
    };

    const range = getCommonRangeAcrossResources(selection, [1, 2]);
    expect(range).toBeNull();
  });
});

describe('usePlannerSelection', () => {
  it('fills missing hours to keep range continuous', () => {
    const { result } = renderHook(() =>
      usePlannerSelection({
        openHour: 10,
        closeHour: 22
      })
    );

    act(() => {
      result.current.handleSelectionChange({
        [makeTimeCellKey(1, 12)]: true,
        [makeTimeCellKey(1, 14)]: true
      });
    });

    expect(result.current.selection).toEqual({
      [makeTimeCellKey(1, 12)]: true,
      [makeTimeCellKey(1, 13)]: true,
      [makeTimeCellKey(1, 14)]: true
    });
    expect(result.current.lastCorrections.some((correction) => correction.type === 'gap-filled')).toBe(
      true
    );
  });

  it('drops selection when a resource is disabled', () => {
    const { result } = renderHook(() =>
      usePlannerSelection({
        openHour: 10,
        closeHour: 22
      })
    );

    act(() => {
      result.current.setEnabledResourceIds([1]);
      result.current.replaceSelectionForResources([1], 12, 14);
    });

    expect(Object.keys(result.current.selection)).toHaveLength(2);

    act(() => {
      result.current.setEnabledResourceIds([]);
    });

    expect(result.current.selection).toEqual({});
  });
});
