<style>
    p::first-letter {
        text-transform: capitalize;
    }
    p {
        white-space: nowrap;
    }
</style>

<p>
    {#if event.eventDays.length === 1}
        {dateNoTime(event.startDate)} from {prettyTime(event.startDate)} to {prettyTime(event.endDate)}
    {:else}
        {prettyDate(event.startDate)} to {prettyDate(event.endDate)}
    {/if}
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

    function isDateToday(date) {
        return date.toLocaleDateString() === new Date().toLocaleDateString();
    }

    function dateNoTime(date) {
        return isDateToday(date) ? 'today' : date.toLocaleDateString();
    }

    function prettyDate(date) {
        return isDateToday(date) ? `today at ${prettyTime(date)}` : dateFormat.format(date);
    }

    function prettyTime(date) {
        return timeFormat.format(date);
    }
</script>