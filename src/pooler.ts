import gsap from "gsap";

type Timeline = gsap.core.Timeline;

const pool = new Set<Timeline>();

function addTimelineToPoolOnceCompleted(timeline: Timeline) {
	timeline.then(() => {
		timeline.pause();
		// Clear as soon as the timeline is finished so animations don't remain on memory
		timeline.clear();
		pool.add(timeline);
	});
}

export function createTimeline(timelineOptions?: gsap.TimelineVars): Timeline {
	const newTimeline = gsap.timeline(timelineOptions);
	newTimeline.pause();
	addTimelineToPoolOnceCompleted(newTimeline);
	return newTimeline;
}

export function useTimeline(timelineOptions?: gsap.TimelineVars): Timeline {
	const poolNext = pool.values().next();

	if (poolNext.done) {
		// Pool is empty
		return createTimeline(timelineOptions);
	}

	const timeline = poolNext.value;
	// Remove from the pool
	pool.delete(timeline);
	addTimelineToPoolOnceCompleted(timeline);
	return timeline;
}
