//time amounts in ms
const ms = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 356 / 12,
    year: 1000 * 60 * 60 * 24 * 356
};

export const bytes = function(bytes: number, unit: 'gb' | 'mb') {
    let units = {
        gb: 1073741824, //gibibytes
        mb: 1048576 //mebibytes
    };
    return (bytes / units[unit]).toFixed(2);
};

export const date = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} `;
};
export const relativeDate = (dateStr: string) => {
    const d = new Date(dateStr),
        delta = Date.now() - d.getTime(),
        years = delta / ms.year,
        months = delta / ms.month,
        weeks = delta / ms.week,
        days = delta / ms.day,
        hours = delta / ms.hour,
        minutes = delta / ms.minute,
        seconds = delta / ms.second,
        format = (num: number, unit: string) => {
            num = parseFloat(num.toFixed(1));
            const floor = Math.floor(num),
                decimal = num - floor;
            //toFixed will round, so 2.96 turns into 3.0 and it will fail the 'if' condition otherwise, make it round first
            if (decimal < 0.1) {
                if (floor === 1) {
                    //strip plural
                    unit = unit.replace(/s$/, '');
                }
                return `${floor} ${unit} ago`
            }
            return `${num} ${unit} ago`;
        };

    if (years > 1) {
        return format(years, 'years');
    }
    else if (months > 1) {
        return format(months, 'months');
    }
    else if (weeks > 1) {
        return format(weeks, 'weeks');
    }
    else if (days > 1) {
        return format(days, 'days');
    }
    else if (hours > 1) {
        return format(hours, 'hours');
    }
    else if (minutes > 1) {
        return format(minutes, 'minutes');
    }
    else {
        return format(seconds, 'seconds');
    }
};

/*
 * Turns an array or string into an array of trimmed tag names without duplicates
 */
export const tags = (tags: string | string[] = []) => {
    if (!Array.isArray(tags)) {
        tags = (tags || '').split(',');
    }
    const tagsSet = new Set<string>();
    tags.forEach(tag => {
        tagsSet.add(tag.trim().toLowerCase().substring(0, 50));
    });
    //don't allow blanks
    tagsSet.delete('');
    return Array.from(tagsSet);
};
