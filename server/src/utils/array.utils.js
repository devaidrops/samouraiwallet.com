module.exports = {
  getRandomElements: (items, count = 1) => {
    const clonedItems = [...items];
    const result = [];
    Array(count).fill("").forEach(() => {
      const index = Math.floor(Math.random() * clonedItems.length);
      result.push(clonedItems[index]);
      clonedItems.splice(index, 1);
    });
    return result;
  },
  getRandomElement: (items) => {
    return items.at(Math.floor(Math.random() * items.length));
  }
}