module.exports = (dep) => {
    return `npm!${dep.package.name}@${dep.package.version}#${dep.request}`;
}