import { addToBasket, clearBasket, getBasket, removeFromBasket, updateBasketItem } from '../services/basketService.js';

export async function index(req, res) {
  const basket = await getBasket(req);
  res.json({ success: true, basket });
}

export async function add(req, res) {
  const basket = await addToBasket(req, req.body.courseId, req.body.scheduleId || null);
  res.status(201).json({ success: true, message: 'Course added to your basket.', basket });
}

export async function update(req, res) {
  const basket = await updateBasketItem(req, req.params.courseId, req.body.scheduleId);
  res.json({ success: true, message: 'Course schedule updated.', basket });
}

export async function remove(req, res) {
  const basket = await removeFromBasket(req, req.params.courseId);
  res.json({ success: true, message: 'Course removed from your basket.', basket });
}

export async function clear(req, res) {
  clearBasket(req);
  res.json({ success: true, message: 'Course basket cleared.', basket: { items: [], subtotal: 0, count: 0 } });
}
