import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import CarbonTimeline from '@/components/dashboard/CarbonTimeline';

describe('CarbonTimeline Accessibility Checks', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<CarbonTimeline />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
