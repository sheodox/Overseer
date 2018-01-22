const formatters = {
    bytes: function(bytes, unit) {
        let units = {
            gb: 1000000000,
            mb: 1000000
        };
        return (bytes / units[unit]).toFixed(2);
    },
    date: function(dateStr) {
        let d = new Date(dateStr),
            day = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} `,
            minutes =  d.getMinutes(),
            time;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        time = `${d.getHours() % 12}:${minutes} ${d.getHours() > 12 ? 'pm' : 'am'}`;
        return `${day} - ${time}`;
    },
    /*
     * Turns an array or string into an array of trimmed tag names without duplicates
     */
    tags: function(tags=[]) {
        if (!Array.isArray(tags)) {
            tags = tags.split(',');
        }
        const noDuplicatesObject = {};
        tags.forEach(tag => {
            noDuplicatesObject[tag.trim().toLowerCase()] = 1;
        });
        //don't allow blanks
        delete noDuplicatesObject[''];
        return Object.keys(noDuplicatesObject);
    }
};

module.exports = formatters;
