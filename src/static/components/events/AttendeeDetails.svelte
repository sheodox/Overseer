<div class="modal-body">
	<TabList {tabs} bind:selectedTab />
	<Tab {selectedTab} tabId="day-breakdown">
		<div class="f-row f-wrap">
			{#each event.attendeesByDay as day}
				<div class="m-2">
					<Attendees rsvps={day.attendees} showEmpty={true}>
						{getDayOfWeekName(day.dayOfWeek)}
						{day.date}
					</Attendees>
				</div>
			{/each}
		</div>
	</Tab>
	<Tab {selectedTab} tabId="overnight">
		<div class="f-row f-wrap">
			{#each event.attendeesByDay as day}
				<div class="m-2">
					<Attendees rsvps={day.attendees.filter((rsvp) => rsvp.stayingOvernight)} showEmpty={true}>
						{getDayOfWeekName(day.dayOfWeek)}
						{day.date}
					</Attendees>
				</div>
			{/each}
		</div>
	</Tab>
</div>

<script lang="ts">
	import { getDayOfWeekName } from '../stores/events';
	import Attendees from './Attendees.svelte';
	import Tab from 'sheodox-ui/Tab.svelte';
	import TabList from 'sheodox-ui/TabList.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;

	$: tabs = createTabs(event);
	let selectedTab: string;

	function createTabs(event: MaskedEvent) {
		const hasMultipleDays = event.eventDays.length > 1,
			baseTabs = [
				{
					id: 'overnight',
					title: 'Overnight Guests',
				},
			];

		return !hasMultipleDays
			? baseTabs
			: [
					{
						id: 'day-breakdown',
						title: 'Day Breakdown',
					},
					...baseTabs,
			  ];
	}
</script>
