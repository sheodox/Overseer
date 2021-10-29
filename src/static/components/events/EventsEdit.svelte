<style>
	textarea {
		width: 100%;
		height: 10rem;
		font-size: 0.9rem;
		resize: vertical;
	}
	form :global(fieldset) {
		border: none;
	}
	form :global(legend) {
		font-size: 1.2rem;
	}
	.field {
		margin: 1rem;
	}
</style>

<PageLayout title={name || 'New Event'}>
	{#if mode === 'create' || $eventFromRoute}
		<form on:submit|preventDefault={submit}>
			<TextInput bind:value={name} id="event-name">Event Name</TextInput>

			<div class="f-row f-wrap">
				<fieldset class="field">
					<legend>Attendance Type</legend>

					<label>
						<input bind:group={attendanceType} value="real" type="radio" />
						In person
					</label>
					<br />
					<label>
						<input bind:group={attendanceType} value="virtual" type="radio" />
						Virtual
					</label>
				</fieldset>

				<div class="field">
					<DateTimeInput label="Start" bind:date={startDate} />
				</div>
				<div class="field">
					<DateTimeInput label="End" bind:date={endDate} />
				</div>
			</div>
			<br />
			<label>
				Details
				<br />
				<textarea bind:value={notes} />
			</label>

			<small><Icon icon="info-circle" /> Details can use markdown!</small>

			<div class="f-row justify-content-end">
				{#if mode === 'edit'}
					<Link href="/events/{$eventFromRoute.id}">
						<span class="button">
							<Icon icon="chevron-left" />
							Back
						</span>
					</Link>
				{/if}
				<button class="primary">{mode === 'create' ? 'Create' : 'Update'} Event</button>
			</div>
		</form>
	{:else}
		<PageSpinner />
	{/if}
</PageLayout>

<script>
	import { createAutoExpireToast, Icon, TextInput } from 'sheodox-ui';
	import DateTimeInput from './DateTimeInput.svelte';
	import { eventFromRoute, eventOps } from '../stores/events';
	import PageSpinner from '../PageSpinner.svelte';
	import Link from '../Link.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';

	export let mode; // create | edit
	let name,
		startDate,
		endDate,
		notes,
		attendanceType = 'real';

	$: initializeData($eventFromRoute);

	let dataInitialized = false;

	function initializeData(event) {
		if (!dataInitialized && event) {
			dataInitialized = true;
			name = event.name;
			notes = event.notes;
			startDate = event.startDate;
			endDate = event.endDate;
			attendanceType = event.attendanceType;
		}
	}

	function validationToast(message) {
		createAutoExpireToast({
			variant: 'error',
			title: 'Error',
			message,
		});
	}

	function submit() {
		if (!name) {
			return validationToast('Enter a name!');
		}
		if (!startDate) {
			return validationToast('Enter a start date and time!');
		}
		if (!endDate) {
			return validationToast('Enter an end date and time!');
		}

		const eventData = {
			name,
			notes,
			attendanceType,
			startDate: startDate.getTime(),
			endDate: endDate.getTime(),
		};

		if (mode === 'create') {
			eventOps.createEvent(eventData);
		} else {
			eventOps.updateEvent($eventFromRoute.id, eventData);
		}
	}
</script>
