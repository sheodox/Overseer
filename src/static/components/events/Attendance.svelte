<div class="mt-2">
	{#if rsvps.length}
		<div class="f-row f-wrap gap-2">
			<Attendees rsvps={going} title="Going" />
			<Attendees rsvps={maybe} title="Maybe" />
			<Attendees rsvps={notGoing} title="Not Going" />
		</div>
	{:else}
		<p><em>Nobody has responded yet.</em></p>
	{/if}
</div>

<script lang="ts">
	import Attendees from './Attendees.svelte';
	import type { MaskedEvent, MaskedRsvp, RSVPStatus } from '../../../shared/types/events';

	export let event: MaskedEvent;

	function byStatus(status: RSVPStatus) {
		return (rsvp: MaskedRsvp) => {
			return rsvp.status === status;
		};
	}

	$: rsvps = event.rsvps;
	$: going = event.rsvps.filter(byStatus('going'));
	$: notGoing = event.rsvps.filter(byStatus('not-going'));
	$: maybe = event.rsvps.filter(byStatus('maybe'));
</script>
