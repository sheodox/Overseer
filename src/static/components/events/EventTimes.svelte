<style>
</style>

<p>
    {#if event.eventDays.length === 1}
        On {event.startDate.toLocaleDateString()} from {prettyTime(event.startDate)} to {prettyTime(event.endDate)}
    {:else}
        From {prettyDate(event.startDate)} to {prettyDate(event.endDate)}
    {/if}
</p>

<script>
    export let event;

    const dateFormat = new Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'short'}),
        timeFormat = new Intl.DateTimeFormat('en-US', {timeStyle: 'short'});

    function prettyDate(date) {
        return dateFormat.format(date);
    }

    function prettyTime(date) {
        return timeFormat.format(date);
    }
</script>