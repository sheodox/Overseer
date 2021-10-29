<div class="modal-body">
	<TabList {tabs} bind:selectedTab />
	<Tab {selectedTab} tabId="day-breakdown">
		<div class="f-row f-wrap">
			{#each event.attendeesByDay as day}
				<Attendees rsvps={day.attendees} showEmpty={true}>
					{getDayOfWeekName(day.dayOfWeek)}
					{day.date}
				</Attendees>
			{/each}
		</div>
	</Tab>
	<Tab {selectedTab} tabId="overnight">
		<div class="f-row f-wrap">
			{#each event.attendeesByDay as day}
				<Attendees rsvps={day.attendees.filter((rsvp) => rsvp.stayingOvernight)} showEmpty={true}>
					{getDayOfWeekName(day.dayOfWeek)}
					{day.date}
				</Attendees>
			{/each}
		</div>
	</Tab>
</div>

<script>
	import { getDayOfWeekName } from '../stores/events';
	import Attendees from './Attendees.svelte';
	import { Tab, TabList } from 'sheodox-ui';
	export let event;

	$: tabs = createTabs(event);
	let selectedTab;

	function createTabs(event) {
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
