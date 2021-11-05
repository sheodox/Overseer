<style>
	h2 {
		margin: 0;
	}
</style>

<div class="attendees">
	<div class="f-row justify-content-between align-items-center">
		<h2>RSVPs</h2>
		{#if rsvps.length && event.eventDays.length > 1}
			<button on:click={() => (showDetails = true)}> Details </button>
		{/if}
	</div>
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

{#if showDetails}
	<Modal bind:visible={showDetails} title="Attendee Details">
		<AttendeeDetails {event} />
	</Modal>
{/if}

<script lang="ts">
	import Modal from 'sheodox-ui/Modal.svelte';
	import Attendees from './Attendees.svelte';
	import AttendeeDetails from './AttendeeDetails.svelte';
	import type { MaskedEvent, MaskedRsvp, RSVPStatus } from '../../../shared/types/events';

	export let event: MaskedEvent;

	let showDetails = false;

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
