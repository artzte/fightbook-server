module.exports = function(page) {
  return [page.treatise, '-', page.title.toLowerCase().replace(/\s/, '-')];
};
