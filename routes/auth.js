const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body;

  const exist = await User.findOne({ email });
  if (exist) {
    return res.status(400).json({ message: 'Такой email уже зарегистрирован' });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    phone,
    email,
    password: hash,
    role: 'client'
  });

  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Пользователь не найден' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({ message: 'Неверный пароль' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role
  });
});

module.exports = router;