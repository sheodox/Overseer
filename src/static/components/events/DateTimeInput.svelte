<div class="f-column">
	<Fieldset legend={label}>
		<div class="f-row gap-1">
			<label>
				Date
				<br />
				<input type="date" bind:value={dateValue} on:change={onDateChange} />
			</label>
			<label>
				Time
				<br />
				<input type="time" bind:value={timeValue} on:change={onTimeChange} />
			</label>
		</div>
	</Fieldset>
</div>

<script lang="ts">
	import { Fieldset } from 'sheodox-ui';
	export let date: Date;
	export let label: string;

	$: dateValue = getInitialDate(date);
	$: timeValue = getInitialTime(date);

	function doubleDigitPadded(number: number) {
		return (number + '').padStart(2, '0');
	}
	function getInitialDate(date: Date) {
		if (date) {
			return [date.getFullYear(), doubleDigitPadded(date.getMonth() + 1), doubleDigitPadded(date.getDate())].join('-');
		}
		return '';
	}

	function getInitialTime(date: Date) {
		if (date) {
			return [doubleDigitPadded(date.getHours()), doubleDigitPadded(date.getMinutes())].join(':');
		}
		return '';
	}

	function parseDate(dateString: string, timeString: string) {
		const [years, months, days] = dateString.split('-'),
			[hours, minutes] = timeString.split(':');

		const possiblyInvalidDate = new Date(+years, +months - 1, +days, +hours, +minutes);

		return isNaN(possiblyInvalidDate.getTime()) ? null : possiblyInvalidDate;
	}

	function onDateChange(e: Event) {
		date = parseDate((e.target as HTMLInputElement).value, timeValue);
	}
	function onTimeChange(e: Event) {
		date = parseDate(dateValue, (e.target as HTMLInputElement).value);
	}
</script>
