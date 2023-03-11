<div class="mt-2">
	{#if rsvps.length}
		<div class="f-row f-wrap gap-3">
			<Attendees rsvps={going} />
			<Attendees rsvps={maybe} />
			<Attendees rsvps={notGoing} />
		</div>
		<div class="muted">
			{count(going.length, maybe.length, notGoing.length)}
		</div>
	{:else}
		<p class="muted"><em>Nobody has responded yet.</em></p>
	{/if}
</div>

<script lang="ts">
	import Attendees from './Attendees.svelte';
	import type { MaskedEvent, RSVPStatus } from '../../../shared/types/events';

	export let event: MaskedEvent;
	export let intervalId: string | null = null;

	function byStatus(status: RSVPStatus) {
		return (rsvp: { status: string }) => {
			return rsvp.status === status;
		};
	}

	$: intervalRspvs = event.eventIntervalRsvps.filter((i) => i.eventIntervalId === intervalId);
	$: rsvps = intervalId ? intervalRspvs : event.rsvps;
	// this this is needlessly complicated, because typescript thinks the types in `rsvps` are incompatible
	$: going = intervalId ? intervalRspvs.filter(byStatus('going')) : event.rsvps.filter(byStatus('going'));
	$: notGoing = intervalId ? intervalRspvs.filter(byStatus('not-going')) : event.rsvps.filter(byStatus('not-going'));
	$: maybe = intervalId ? intervalRspvs.filter(byStatus('maybe')) : event.rsvps.filter(byStatus('maybe'));

	function count(going: number, maybe: number, notGoing: number) {
		const summary: string[] = [];

		if (going) {
			summary.push(`${going} going`);
		}
		if (maybe) {
			summary.push(`${maybe} maybe`);
		}
		if (notGoing) {
			summary.push(`${notGoing} not going`);
		}
		return summary.join(', ');
	}
</script>
