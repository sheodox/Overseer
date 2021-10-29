<style>
</style>

<div class="f-column">
	<fieldset>
		<legend>{label}</legend>

		<label>
			Date
			<br />
			<input type="date" bind:value={dateValue} />
		</label>
		<br />
		<label>
			Time
			<br />
			<input type="time" bind:value={timeValue} />
		</label>
	</fieldset>
</div>

<script>
	export let date;
	export let label;

	let dateValue = getInitialDate(),
		timeValue = getInitialTime();

	function doubleDigitPadded(number) {
		return (number + '').padStart(2, '0');
	}
	function getInitialDate() {
		if (date) {
			return [date.getFullYear(), doubleDigitPadded(date.getMonth() + 1), doubleDigitPadded(date.getDate())].join('-');
		}
		return '';
	}

	function getInitialTime() {
		if (date) {
			return [doubleDigitPadded(date.getHours()), doubleDigitPadded(date.getMinutes())].join(':');
		}
		return '';
	}

	$: date = parseDate(dateValue, timeValue);

	function parseDate(dateString, timeString) {
		const [years, months, days] = dateString.split('-'),
			[hours, minutes] = timeString.split(':');

		const possiblyInvalidDate = new Date(years, months - 1, days, hours, minutes);

		return isNaN(possiblyInvalidDate.getTime()) ? null : possiblyInvalidDate;
	}
</script>
