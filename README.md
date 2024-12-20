# usePointerSwipe-ts

[![npm downloads](https://img.shields.io/npm/dm/usepointerswipe-ts)](https://www.npmjs.com/package/usepointerswipe-ts)
[![bundle size](https://img.shields.io/bundlephobia/min/usepointerswipe-ts)](https://bundlephobia.com/result?p=usepointerswipe-ts)

A React hook for detecting swipe based on PointerEvents.

## Installation

You can install the `usepointerswipe-ts` package via npm (or whatever):

```bash
npm install usepointerswipe-ts
```

## Usage

```javascript
import { useCallback, useRef, useState } from "react";
import usePointerSwipe from "usepointerswipe-ts";

function App() {
  const target = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const [left, setLeft] = useState<string>("0");
  const [opacity, setOpacity] = useState<number>(1);

  const containerWidth = container.current?.offsetWidth;

  const reset = useCallback(() => {
    setLeft("0");
    setOpacity(1);
  }, []);

  const { isSwiping, distanceX, direction } = usePointerSwipe(target, {
    pointerTypes: ["touch", "mouse"],
    disableTextSelect: true,
    resetDirectionWhenPointerUp: true,
    onSwipe: () => {
      if (containerWidth) {
        if (distanceX < 0) {
          const distance = Math.abs(distanceX);
          setLeft(`${distance}px`);
          setOpacity(1.25 - distance / containerWidth);
        } else {
          setLeft("0");
          setOpacity(1);
        }
      }
    },
    onSwipeEnd: () => {
      if (
        distanceX < 0 &&
        containerWidth &&
        Math.abs(distanceX) / containerWidth >= 0.5
      ) {
        setLeft("100%");
        setOpacity(0);
      } else {
        setLeft("0");
        setOpacity(1);
      }
    },
  });

  return (
    <>
      <main
        ref={container}
        className="bg-gray-200 rounded relative w-full h-[80px] m-auto flex items-center justify-center overflow-hidden"
      >
        <button onClick={reset}>Reset</button>
        <div
          ref={target}
          className="absolute w-full h-full top-0 left-0 bg-[#3eaf7c] flex items-center justify-center"
          style={{
            left,
            opacity,
            transition: "all 200ms ease-linear",
          }}
        >
          <p className="flex text-white items-center">
            Swipe <span>→</span>
          </p>
        </div>
      </main>
      <p>isSwiping: {+isSwiping}</p>
      <p>Direction: {direction}</p>
    </>
  );
}
export default App;

```

## DEMO

[URL](https://codesandbox.io/p/sandbox/zqpqwq?file=%2Fsrc%2FApp.tsx)
