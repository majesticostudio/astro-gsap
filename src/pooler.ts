import gsap from "gsap";

/**
 * A cache of timelines
 */
export const timelines: {
	[key: string]: gsap.core.Timeline;
} = {};

/**
 * Create a new timeline and add it to the cache
 * @param key
 * @param timelineOptions
 * @returns
 */
export function createTimeline(
	key: string,
	timelineOptions?: gsap.TimelineVars,
) {
	if (timelineOptions) {
		timelineOptions.paused = true;
	}
	const newTimeline = gsap.timeline(timelineOptions);
	timelines[key] = newTimeline;
	return newTimeline;
}

/**
 * Get the timeline from the cache if it exists, otherwise create a new one
 * @param key
 * @param timelineOptions
 * @returns
 */
export function useTimeline(
	key: string,
	timelineOptions?: gsap.TimelineVars,
): gsap.core.Timeline {
	// Here take the timeline from the cache if it exists, otherwise create a new one
	const timeline: gsap.core.Timeline =
		timelines[key] ?? createTimeline(key, timelineOptions);

	let clearAdded = false;

	const handler: ProxyHandler<gsap.core.Timeline> = {
		get(
			target: gsap.core.Timeline,
			prop: PropertyKey,
			receiver: unknown,
		): unknown {
			const origMethod = target[prop as keyof gsap.core.Timeline];
			if (typeof origMethod === "function") {
				return (...args: unknown[]) => {
					if (!clearAdded) {
						target.clear();
						clearAdded = true;
					}
					const result = origMethod.apply(target, args);

					if (prop === "play") {
						clearAdded = false;
					}

					// Ensure the proxy maintains the correct this context
					return result === target ? receiver : result;
				};
			}
			return origMethod;
		},
	};

	return new Proxy(timeline, handler);
}

export function generateKeyForElement(element: Element) {
	const str = element.outerHTML; // Using outerHTML to get a full string representation of the element
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char; // Bitwise operations to mix the input string's characters
		hash |= 0; // Convert to a 32bit integer
	}

	// Converting the hash to a base-36 string and ensuring it's a positive value
	const hashedString = Math.abs(hash).toString(36).substring(0, 20);
	return hashedString;
}
