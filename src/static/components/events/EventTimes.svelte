<style>
    p::first-letter {
        text-transform: capitalize;
    }
</style>

<p class="m-0">
    {eventTime(event.startDate, event.endDate, event.eventDays.length)}
</p>
<script>
    import {onDestroy} from 'svelte';
    export let event;
    let now = Date.now();

    const dateFormat = new Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'short'}),
        timeFormat = new Intl.DateTimeFormat('en-US', {timeStyle: 'short'});

    $: prettyStartDate = event.startDate.toLocaleDateString();
    $: startDay = prettyStartDate === new Date(now).toLocaleDateString() ? 'Today' : `On ${prettyStartDate}`;

    const interval = setInterval(() => {
        now = Date.now();
    }, 1000 * 60);

    onDestroy(() => {
        clearInterval(interval);
    })

    function eventTime(start, end, numDays) {
        if (numDays === 1) {
            return `${dateString(start)} from ${prettyTime(start)} to ${prettyTime(end)}`;
        }
        else {
            return `${prettyDate(start)} to ${prettyDate(end)}`
        }
    }

    function dateString(date) {
        if (isDateToday(date)) {
            return 'today';
        }
        return `${getMonth(date)} ${date.getDate()}` + (isDateThisYear(date) ? '' : `, ${date.getFullYear()}`);
    }

    function getMonth(date) {
        return [
            'January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October',
            'November', 'December'
        ][date.getMonth()]
    }

    function isDateThisYear(date) {
        return new Date().getFullYear() === date.getFullYear();
    }

    function isDateToday(date) {
        return date.toLocaleDateString() === new Date().toLocaleDateString();
    }

    function prettyDate(date) {
        return `${dateString(date)}, ${prettyTime(date)}`;
    }

    function prettyTime(date) {
        //if the time is an exact hour just get rid of the minutes from the string
        return timeFormat.format(date).replace(':00', '');
    }
</script>