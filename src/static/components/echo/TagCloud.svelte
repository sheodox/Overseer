<style>
    div {

    }
    input {
        display: none;
    }
    input:checked + label {
        color: var(--muted);
    }
</style>

<div class="f-row f-wrap">
    {#each $echoTagCloud as tag}
        <input type="checkbox" id="tag-cloud-{tag}" checked={tagArray.includes(tag)} on:change={() => toggleTag(tag)}/>
        <label class="button small" for="tag-cloud-{tag}">
            {tag}
        </label>
    {/each}
</div>

<script>
    import {echoTagCloud} from "../stores/echo";
    import {tags as formatTags} from "../../../shared/formatters";

    export let tags;

    $: tagArray = formatTags(tags);

    function toggleTag(tag) {
        const existingTags = formatTags(tags);
        if (existingTags.includes(tag)) {
            tags = existingTags.filter(t => t !== tag).join(', ');
        }
        else {
            tags = [
                ...existingTags,
                tag
            ].join(', ');
        }
    }
</script>