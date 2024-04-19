import gsap from "gsap";

export const gsapTimelines: {
	[key: string]: gsap.core.Timeline;
} = {};

export function createTimeline(
	key: string,
	timelineOptions?: gsap.TimelineVars,
) {
	const newTimeline = gsap.timeline(timelineOptions);
	newTimeline.paused(true);
	gsapTimelines[key] = newTimeline;
	return newTimeline;
}

export function loadTimeline(
	key: string,
	timelineOptions?: gsap.TimelineVars,
): gsap.core.Timeline {
	// Here take the timeline from the cache if it exists, otherwise create a new one
	const timeline: gsap.core.Timeline =
		gsapTimelines[key] ?? createTimeline(key, timelineOptions);

	let clearAdded = false;

	const handler: ProxyHandler<gsap.core.Timeline> = {
		get(target: gsap.core.Timeline, prop: PropertyKey, receiver: any): any {
			const origMethod = target[prop as keyof gsap.core.Timeline];
			if (typeof origMethod === "function") {
				return (...args: any[]) => {
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
