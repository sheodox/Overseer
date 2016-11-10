const validNameMinLength = 3,
    validNameMaxLength = 20;

export default {
    name: (name, allowSpaces) => {
        if (name && typeof name === 'string') {
            //at least a minimum number of non-space characters, alphanumeric
            const reg = allowSpaces ? /^[\w ]*$/ : /^\w*$/,
                actualCharacters = name.replace(/\W/, '');
            return actualCharacters.length >= validNameMinLength
                && actualCharacters.length <= validNameMaxLength
                && reg.test(name);
        }
        return false;
    }
}