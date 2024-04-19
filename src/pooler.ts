import gsap from "gsap";

type Timeline = gsap.core.Timeline;
type TimelineOptions = Omit<gsap.TimelineVars, "paused">;

const pool = new Set<Timeline>();

/**
 * Create a new paused timeline.
 * @param key
 * @param timelineOptions
 * @returns
 */
export function createTimeline(timelineOptions?: TimelineOptions): Timeline {
	const newTimeline = gsap.timeline({
		...timelineOptions,
		paused: true,
	});
	return newTimeline;
}

/**
 * Get a timeline from the pool or create a new one if the pool is empty.
 * @param key
 * @param timelineOptions
 * @returns
 */
export function useTimeline(timelineOptions?: TimelineOptions): Timeline {
	const poolNext = pool.values().next();

	if (poolNext.done) {
		// Pool is empty
		return createTimeline(timelineOptions);
	}

	const timeline = poolNext.value;
	// Remove from the pool
	pool.delete(timeline);
	return timeline;
}

export function addToPool(timeline: Timeline) {
	timeline.pause();
	// Clear as soon as the timeline is finished so animations don't remain on memory
	timeline.clear();
	pool.add(timeline);
}

/**
 * Run a function with a Timeline from the pool.
 *
 * The timeline is added back to the pool once it's finished.
 */
export function withTimeline(fn: (timeline: Timeline) => void) {
	const timeline = useTimeline();
	fn(timeline);
	if (timeline.isActive()) {
		timeline.then(() => addToPool(timeline));
	} else {
		addToPool(timeline);
	}
}
