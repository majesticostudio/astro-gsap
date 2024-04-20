import gsap from "gsap";

export const pool = new Set<gsap.core.Timeline>();

document.addEventListener("astro:before-swap", (ev) => {
	// before swapping with a new page clean all the timelines
	for (const timeline of pool.values()) {
		timeline.kill();
	}
	pool.clear();
});

/**
 * Add the timeline to the pool so the pool can be used later on
 * to kill all the timelines so they can be garbage collected
 */
class TimelineRecycler extends gsap.core.Timeline {
	constructor(vars?: gsap.TimelineVars, time?: number) {
		super(vars, time);
		pool.add(this);
	}
}

const gsapExt = {
	...gsap,
	timeline: (vars?: gsap.TimelineVars) => {
		return new TimelineRecycler(vars);
	},
};

export default gsapExt;
