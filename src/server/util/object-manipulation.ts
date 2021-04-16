export function pickProperties<Type, TProp extends keyof Type>(obj: Type, properties: TProp[]): Pick<Type, TProp> {
    const picked: any = {}
    for (const prop of properties)  {
        picked[prop] = obj[prop];
    }
    return picked;
}

