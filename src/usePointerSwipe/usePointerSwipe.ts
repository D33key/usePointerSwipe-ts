import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type PointerType = 'mouse' | 'touch' | 'pen';
export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface UsePointerSwipeOptions {
	threshold?: number;
	onSwipeStart?: (e: PointerEvent) => void;
	onSwipe?: (e: PointerEvent) => void;
	onSwipeEnd?: (e: PointerEvent, direction: Direction) => void;

	pointerTypes?: PointerType[];

	disableTextSelect?: boolean;

	resetDirectionWhenPointerUp?: boolean;
}

const initialValue = {
	startX: 0,
	startY: 0,
	endX: 0,
	endY: 0,
};

export function usePointerSwipe<RefElement extends HTMLElement>(
	target: React.MutableRefObject<RefElement | undefined | null>,
	options: UsePointerSwipeOptions = {},
) {
	const {
		threshold = 50,
		onSwipe,
		onSwipeEnd,
		onSwipeStart,
		disableTextSelect = false,
		pointerTypes,
		resetDirectionWhenPointerUp = true,
	} = options;

	const isPointerDown = useRef(false);

	const [isSwiping, setIsSwiping] = useState(false);
	const [position, setPosition] = useState(initialValue);

	const { distanceX, distanceY, isThresholdExceed } = useMemo(() => {
		const distanceX = position.startX - position.endX;
		const distanceY = position.startY - position.endY;
		const isThresholdExceed =
			Math.max(Math.abs(distanceX), Math.abs(distanceY)) >= threshold;
		return { distanceX, distanceY, isThresholdExceed };
	}, [position, threshold]);

	const direction = useMemo<Direction>(() => {
		if (!isThresholdExceed) return 'none';

		return Math.abs(distanceX) > Math.abs(distanceY)
			? distanceX > 0
				? 'left'
				: 'right'
			: distanceY > 0
			? 'up'
			: 'down';
	}, [distanceX, distanceY, isThresholdExceed]);

	const isEventAllowed = useCallback((e: PointerEvent) => {
		if (pointerTypes)
			return pointerTypes.includes(e.pointerType as PointerType);
		return e.buttons === 0 || e.buttons === 1;
	}, []);

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!isEventAllowed(event)) return;
			isPointerDown.current = true;

			(event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);

			const { clientX: x, clientY: y } = event;

			setPosition({
				startX: x,
				startY: y,
				endX: x,
				endY: y,
			});
			onSwipeStart?.(event);
		};

		target.current?.addEventListener('pointerdown', handlePointerDown);

		return () => {
			target.current?.removeEventListener('pointerdown', handlePointerDown);
		};
	}, []);

	useEffect(() => {
		const pointerUp = (event: PointerEvent) => {
			if (!isEventAllowed(event)) return;
			if (isSwiping) onSwipeEnd?.(event, direction);
			if (resetDirectionWhenPointerUp) setPosition(initialValue);

			setIsSwiping(false);
			isPointerDown.current = false;
		};

		target.current?.addEventListener('pointerup', pointerUp);

		return () => {
			target.current?.removeEventListener('pointerup', pointerUp);
		};
	}, [isSwiping, position]);

	useEffect(() => {
		const pointerMove = (event: PointerEvent) => {
			if (!isEventAllowed(event)) return;
			if (!isPointerDown.current) return;
			const { clientX: x, clientY: y } = event;

			setPosition((prev) => ({ ...prev, endX: x, endY: y }));

			if (!isSwiping && isThresholdExceed) {
				setIsSwiping(true);
			}

			if (isSwiping) {
				onSwipe?.(event);
			}
		};

		target.current?.addEventListener('pointermove', pointerMove);
		return () => {
			target.current?.removeEventListener('pointermove', pointerMove);
		};
	}, [isThresholdExceed, isSwiping, position]);

	useEffect(() => {
		const style = target.current?.style;
		if (style) {
			style.touchAction = 'none';

			if (disableTextSelect) {
				style.userSelect = 'none';
			}
		}
	}, []);

	return {
		isSwiping,
		direction,
		posStart: { x: position.startX, y: position.startY },
		posEnd: { x: position.endX, y: position.endY },
		distanceX,
		distanceY,
	};
}
