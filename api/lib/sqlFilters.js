export const isPublishedOnly = (value) => {
    return value === 'true' || value === '1';
};

export const applyPublishedDateFilter = (sql, startParam = ':start_date', endParam = ':end_date') => {
    const publishedFilter =
        `\n  AND DATE(p.published_at_date) >= DATE(${startParam})` +
        `\n  AND DATE(p.published_at_date) <= DATE(${endParam})`;

    if (sql.includes('GROUP BY')) {
        return sql.replace('GROUP BY', `${publishedFilter}\nGROUP BY`);
    }

    const replaced = sql.replace(/;\s*$/, `${publishedFilter};\n`);
    if (replaced !== sql) {
        return replaced;
    }

    return `${sql}${publishedFilter}`;
};
