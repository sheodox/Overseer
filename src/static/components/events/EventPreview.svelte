<style>
	.event {
		color: white;
	}
	.card {
		border-radius: 3px;
	}
	.attendees-preview {
		overflow: hidden;
	}
</style>

<Link href="/events/{event.id}" noHoverStyles={true}>
	<div class="event">
		<div class="card clickable p-4">
			<div class="f-row justify-content-between align-items-baseline">
				<span class="shdx-font-size-5">
					{event.name}
				</span>
			</div>

			<p class="my-3">
				<EventTimes {event} />
			</p>

			<div class="f-row justify-content-between">
				<div class="f-row gap-1 mr-2 attendees-preview">
					<div title="{numAttendees} {numAttendees === 1 ? 'person' : 'people'} going" class="mr-2">
						<Icon icon="user-friends" />
						{numAttendees} <span class="sr-only">People Going</span>
					</div>
					{#each attendees as userId}
						<UserBubble {userId} mode="minimal" />
					{/each}
				</div>

				{#if event.userRsvp}
					<span>
						<RSVPStatus status={event.userRsvp?.status} />
					</span>
				{/if}
			</div>
		</div>
	</div>
</Link>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import Link from '../Link.svelte';
	import UserBubble from '../UserBubble.svelte';
	import EventTimes from './EventTimes.svelte';
	import RSVPStatus from './RSVPStatus.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;

	$: attendees = event.rsvps.filter(({ status }) => status === 'going').map(({ userId }) => userId);
	$: numAttendees = attendees.length;
</script>
