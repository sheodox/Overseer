<style>
	.sub-panel {
		margin: 0;
		padding: 0;
	}
	h1 {
		margin: 0;
		font-size: var(--sx-font-size-10);
	}
	.notes {
		line-height: 1.6;
	}
	.notes :global(p:last-child) {
		margin-bottom: 0;
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
		border-radius: 5px;
	}
	@media (max-width: 800px) {
		.collapsing-row {
			flex-direction: column;
		}
		h1 {
			font-size: var(--sx-font-size-6);
		}
	}
</style>

{#if !$eventsInitialized}
	<PageSpinner />
{:else if !$eventFromRoute}
	<p>Couldn't find an event for this ID, did it get deleted?</p>
	<p><Link href="/events">Back to the events list.</Link></p>
{:else}
	<div id="event-view" class="px-2">
		<div class="f-row justify-content-center">
			<EventNotificationReminder />
		</div>

		<div class="collapsing-row gap-5 mt-4">
			<div class="sub-panel f-1">
				<h1>{$eventFromRoute.name}</h1>
				<div class="f-row f-wrap justify-content-between align-items-start gap-3">
					<Fieldset legend="Details">
						<AttendanceTypeBadge event={$eventFromRoute} showText={true} />
						<EventTimes event={$eventFromRoute} />
					</Fieldset>
					{#if booker.events.rsvp}
						<RSVP
							status={userRsvp?.status}
							showFixGoingWarning={userGoing && isMultipleDays && !userRsvp?.rsvpDays.length}
							on:rsvp={rsvpPrompt}
						/>
					{/if}
				</div>

				<div class="notes has-inline-links">
					{@html $eventFromRoute.notesRendered}
				</div>

				{#if booker.events.organize}
					<div class="f-row justify-content-end sx-font-size-3">
						<MenuButton>
							<span slot="trigger">
								Event Options
								<Icon icon="chevron-down" />
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
		</div>

		<div class="detail-tabs px-2 py-2">
			<TabList bind:selectedTab {tabs} />
			<Tab {selectedTab} tabId="rsvps">
				<Attendance event={$eventFromRoute} />
			</Tab>
			<Tab {selectedTab} tabId="rsvps-day">
				<AttendeeDetails event={$eventFromRoute} filter="day" />
			</Tab>
			<Tab {selectedTab} tabId="rsvps-overnight">
				<AttendeeDetails event={$eventFromRoute} filter="overnight" />
			</Tab>
		</div>

		{#if numNotes > 0}
			<h2 class="mb-0">Notes ({numNotes})</h2>
			<RSVPNotes rsvps={$eventFromRoute.rsvps} />
		{/if}
	</div>
{/if}

{#if showSurvey}
	<Modal bind:visible={showSurvey} title={pendingStatusName} on:closed={() => (pendingStatus = null)}>
		<RSVPSurvey bind:pendingStatus bind:visible={showSurvey} />
	</Modal>
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
	import Link from '../Link.svelte';
	import RSVP from './RSVP.svelte';
	import RSVPSurvey from './RSVPSurvey.svelte';
	import AttendanceTypeBadge from './AttendanceTypeBadge.svelte';
	import Attendance from './Attendance.svelte';
	import EventTimes from './EventTimes.svelte';
	import RSVPNotes from './RSVPNotes.svelte';
	import EventNotificationReminder from './EventNotificationReminder.svelte';
	import AttendeeDetails from './AttendeeDetails.svelte';
	import type { RSVPStatus } from '../../../shared/types/events';

	let pendingStatus: RSVPStatus,
		showDeleteConfirm = false,
		selectedTab: string,
		showSurvey = false;

	$: pendingStatusName = { going: 'Going', 'not-going': 'Not Going', maybe: 'Maybe' }[pendingStatus];
	$: userRsvp = $eventFromRoute?.userRsvp;
	$: isMultipleDays = $eventFromRoute?.eventDays.length > 1;
	$: userGoing = userRsvp?.status === 'going';
	$: numNotes = $eventFromRoute?.rsvps.reduce((sum, rsvp) => {
		return sum + (rsvp.notes ? 1 : 0);
	}, 0);
	$: tabs = [
		{
			id: 'rsvps',
			title: 'RSVPs',
		},
		isMultipleDays && {
			id: 'rsvps-day',
			title: 'RSVPs By Day',
		},
		isMultipleDays && {
			id: 'rsvps-overnight',
			title: 'Overnight Attendees',
		},
	].filter((tab) => !!tab);

	$: $pageName = $eventFromRoute?.name ?? 'Events';

	function rsvpPrompt(e: CustomEvent<RSVPStatus>) {
		pendingStatus = e.detail;
		showSurvey = true;
	}

	function deleteEvent() {
		eventOps.deleteEvent($eventFromRoute.id);
	}
</script>
