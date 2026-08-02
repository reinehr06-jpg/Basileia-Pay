import { describe, it, expect } from 'vitest';
import { propsToStyle } from '../core/layoutEngine';

describe('layoutEngine', () => {
  it('resolves responsive props correctly', () => {
    const props = {
      width: { base: 100, tablet: 200, mobile: 300 },
      padding: { base: 10 },
      bgColor: '#fff'
    };

    const mobileStyle = propsToStyle(props, 'mobile');
    expect(mobileStyle.width).toBe('300px');
    expect(mobileStyle.padding).toBe('10px');
    expect(mobileStyle.backgroundColor).toBe('#fff');

    const tabletStyle = propsToStyle(props, 'tablet');
    expect(tabletStyle.width).toBe('200px');
    
    const desktopStyle = propsToStyle(props, 'desktop');
    expect(desktopStyle.width).toBe('100px');
  });
});
