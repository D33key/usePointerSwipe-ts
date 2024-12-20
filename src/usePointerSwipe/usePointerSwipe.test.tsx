import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import usePointerSwipe, { UsePointerSwipeOptions } from './usePointerSwipe';

function TestComponent({ options }: { options?: UsePointerSwipeOptions }) {
	const targetRef = useRef<HTMLDivElement | null>(null);
	const { isSwiping, direction, posStart, posEnd, distanceX, distanceY } =
		usePointerSwipe(targetRef, options);

	return (
		<div ref={targetRef} style={{ width: '100px', height: '100px' }}>
			{isSwiping ? `Swiping: ${direction}` : 'Not swiping'}
			<div>{`Start: (${posStart.x}, ${posStart.y})`}</div>
			<div>{`End: (${posEnd.x}, ${posEnd.y})`}</div>
			<div>{`DistanceX: ${distanceX}`}</div>
			<div>{`DistanceY: ${distanceY}`}</div>
		</div>
	);
}

describe('usePointerSwipe hook', () => {
	beforeEach(() => {
		(window as any).PointerEvent = MouseEvent;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize swipe values correctly', () => {
		const { getByText } = render(<TestComponent />);
		const element = getByText('Not swiping');

		expect(element).toBeInTheDocument();
	});

	it('should start swiping and detect direction', async () => {
		const { getByText } = render(<TestComponent />);
		const element = getByText('Not swiping');
		const target = element.closest('div') as HTMLElement;

		fireEvent.pointerDown(target, { clientX: 50, clientY: 50, pointerId: 1 });

		fireEvent.pointerMove(target, { clientX: 100, clientY: 50, pointerId: 1 });

		expect(getByText('Start: (50, 50)')).toBeInTheDocument();
		expect(getByText('End: (100, 50)')).toBeInTheDocument();
	});

	it('should disable text selection when disableTextSelect is true', () => {
		const { container } = render(
			<TestComponent options={{ disableTextSelect: true }} />,
		);

		const style = (container.firstChild as HTMLElement)?.getAttribute('style');
		expect(style).toContain('user-select: none;');
	});

	it('should reset position when resetDirectionWhenPointerUp is true', () => {
		const { getByText } = render(
			<TestComponent options={{ resetDirectionWhenPointerUp: true }} />,
		);

		const element = getByText('Not swiping');
		const target = element.closest('div') as HTMLElement;

		fireEvent.pointerDown(target, { clientX: 50, clientY: 50, pointerId: 1 });

		fireEvent.pointerMove(target, { clientX: 150, clientY: 50, pointerId: 1 });

		fireEvent.pointerUp(target, { clientX: 150, clientY: 50, pointerId: 1 });

		expect(getByText('Start: (0, 0)')).toBeInTheDocument();
		expect(getByText('End: (0, 0)')).toBeInTheDocument();
	});

	it('should not exceed threshold if the distance is less than the threshold', () => {
		const { getByText } = render(<TestComponent options={{ threshold: 50 }} />);
		const element = getByText('Not swiping');
		const target = element.closest('div') as HTMLElement;

		fireEvent.pointerDown(target, { clientX: 50, clientY: 50, pointerId: 1 });

		fireEvent.pointerMove(target, { clientX: 70, clientY: 50, pointerId: 1 });

		fireEvent.pointerUp(target, { clientX: 70, clientY: 50, pointerId: 1 });

		expect(getByText('Not swiping')).toBeInTheDocument();
	});
});
