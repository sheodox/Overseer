<style lang="scss">
	h1 {
		margin: 0;
		font-size: var(--sx-font-size-10);
	}
	.notes {
		line-height: 1.6;
		:global(p:last-of-type) {
			margin-bottom: 0;
		}
		:global(p:first-of-type) {
			margin-top: 0;
		}
	}
	#event-view {
		width: 100%;
		max-width: 65rem;
	}
	.collapsing-row {
		display: flex;
	}
	.detail-tabs {
		background: var(--sx-gray-transparent);
		border-radius: 10px;
	}
	@media (max-width: 800px) {
		.collapsing-row {
			flex-direction: column;
		}
		h1 {
			font-size: var(--sx-font-size-6);
		}
	}
	.rsvp-link {
		width: 100%;
		text-align: center;
	}
	.rsvp-status {
		border-radius: 1rem;
	}
	div :global(fieldset) {
		margin: 0;
	}
</style>

{#if !$eventsInitialized}
	<PageSpinner />
{:else if !$eventFromRoute}
	<p>Couldn't find an event for this ID, did it get deleted?</p>
	<p><Link href="/events">Back to the events list.</Link></p>
{:else}
	<div id="event-view" class="px-2" style="--sx-arg-fieldset-legend-color: var(--sx-gray-100)">
		<div class="f-row justify-content-center">
			<EventNotificationReminder />
		</div>

		<div class="collapsing-row gap-5 mt-4" style="--sx-arg-fieldset-padding: var(--sx-spacing-5);">
			<div class="f-1 f-column gap-4">
				<div class="f-row justify-content-between align-items-center">
					<h1>{$eventFromRoute.name}</h1>
					{#if booker.events.organize}
						<div class="f-row justify-content-end sx-font-size-3">
							<MenuButton>
								<span slot="trigger">
									<span class="sr-only">Event Options</span>
									<Icon icon="ellipsis-v" variant="icon-only" />
								</span>
								<ul slot="menu">
									<li>
										<button on:click={() => page(`/events/${$eventFromRoute.id}/edit`)}>
											<Icon icon="edit" />
											Edit
										</button>
									</li>
									<li>
										<button on:click={() => (showDeleteConfirm = true)}>
											<Icon icon="trash" />
											Delete
										</button>
									</li>
								</ul>
							</MenuButton>
						</div>
					{/if}
				</div>

				<Fieldset legend="Details" contentClasses="f-column gap-1 f-1" size="large">
					<AttendanceTypeBadge event={$eventFromRoute} showText={true} />
					<EventTimes startDate={$eventFromRoute.startDate} endDate={$eventFromRoute.endDate} />

					{#if booker.events.rsvp}
						<div class="f-row justify-content-between align-items-center">
							<div class="rsvp-status">
								<RSVPStatusBadge status={userRsvp?.status} />
							</div>
							<Link href="/events/{$eventFromRoute.id}/rsvp">
								<div class="button primary py-0 m-0 rsvp-link">
									{#if userRsvp?.status}
										<p>Update RSVP</p>
									{:else}
										<p>RSVP</p>
									{/if}
								</div>
							</Link>
						</div>
					{/if}
				</Fieldset>

				<Fieldset legend="Description" size="large">
					<div class="notes has-inline-links">
						{@html $eventFromRoute.notesRendered}
					</div>
				</Fieldset>

				<div class="detail-tabs p-5" style="margin-top: 10px;">
					<TabList bind:selectedTab {tabs} />
					<Tab {selectedTab} tabId="rsvps">
						<Attendance event={$eventFromRoute} />
					</Tab>
					<Tab {selectedTab} tabId="rsvps-intervals">
						<EventItineraryDetails event={$eventFromRoute} />
					</Tab>
					<Tab {selectedTab} tabId="rsvps-overnight">
						<AttendeeDetails event={$eventFromRoute} />
					</Tab>
				</div>
			</div>
		</div>
		{#if numNotes > 0}
			<h2 class="mb-0">Notes ({numNotes})</h2>
			<RSVPNotes rsvps={$eventFromRoute.rsvps} />
		{/if}
	</div>
{/if}

{#if showDeleteConfirm}
	<Modal bind:visible={showDeleteConfirm} title="Delete Event">
		<div class="modal-body">
			Are you sure you want to delete the event "{$eventFromRoute.name}"?
		</div>
		<div class="modal-footer">
			<button on:click={() => (showDeleteConfirm = false)}> Cancel </button>
			<button on:click={deleteEvent} class="danger">
				<Icon icon="trash" />
				Delete
			</button>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { MenuButton, Icon, Modal, Tab, TabList, Fieldset } from 'sheodox-ui';
	import { pageName, booker } from '../stores/app';
	import PageSpinner from '../PageSpinner.svelte';
	import { eventFromRoute, eventOps, eventsInitialized } from '../stores/events';
	import page from 'page';
	import EventItineraryDetails from './EventItineraryDetails.svelte';
	import RSVPStatusBadge from './RSVPStatus.svelte';
	import Link from '../Link.svelte';
	import AttendanceTypeBadge from './AttendanceTypeBadge.svelte';
	import Attendance from './Attendance.svelte';
	import EventTimes from './EventTimes.svelte';
	import RSVPNotes from './RSVPNotes.svelte';
	import EventNotificationReminder from './EventNotificationReminder.svelte';
	import AttendeeDetails from './AttendeeDetails.svelte';

	let showDeleteConfirm = false,
		selectedTab: string;

	$: userRsvp = $eventFromRoute?.userRsvp;
	$: hasMultipleIntervals = $eventFromRoute?.eventIntervals.length > 1;
	$: numNotes = $eventFromRoute?.rsvps.reduce((sum, rsvp) => {
		return sum + (rsvp.notes ? 1 : 0);
	}, 0);
	$: tabs = [
		{
			id: 'rsvps',
			title: 'RSVPs',
		},
		hasMultipleIntervals && {
			id: 'rsvps-intervals',
			title: 'Itinerary',
		},
		hasMultipleIntervals &&
			$eventFromRoute.attendanceType === 'real' && {
				id: 'rsvps-overnight',
				title: 'Overnight Guests',
			},
	].filter((tab) => !!tab);

	$: $pageName = $eventFromRoute?.name ?? 'Events';

	function deleteEvent() {
		eventOps.deleteEvent($eventFromRoute.id);
	}
</script>
