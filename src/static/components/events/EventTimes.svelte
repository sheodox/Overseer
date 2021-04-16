<style>
    p::first-letter {
        text-transform: capitalize;
    }
</style>

<p>
    {#if event.eventDays.length === 1}
        {event.startDate.toLocaleDateString()} from {prettyTime(event.startDate)} to {prettyTime(event.endDate)}
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

    function prettyDate(date) {
        const isToday = date.toLocaleDateString() === new Date().toLocaleDateString();
        return isToday ? `today at ${prettyTime(date)}` : dateFormat.format(date);
    }

    function prettyTime(date) {
        return timeFormat.format(date);
    }
</script>