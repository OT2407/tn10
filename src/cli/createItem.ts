import { createItem } from '../services/itemService';

(async () => {
  const item = await createItem(process.env.OWNER_ID!, undefined);
  console.log(item.id);
})();
