require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL);

async function seed() {
  await Product.deleteMany();
  await User.deleteMany();

  await Product.insertMany([
    {
      name: 'Сникерс',
      category: 'Торты',
      description: 'Шоколадный торт с карамелью, арахисом и нежным кремом.',
      composition: 'Шоколадный бисквит, карамель, арахис, крем-чиз, ганаш.',
      price: 13500,
      image: '/images/snickers1.PNG',
      isBestSeller: true,
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 13500 },
        { label: '20 см', weight: '2 кг', price: 16500 },
        { label: '24 см', weight: '3 кг', price: 22000 }
      ]
    },
    {
      name: 'Наполеон',
      category: 'Торты',
      description: 'Классический слоёный торт с заварным кремом.',
      composition: 'Слоёные коржи, заварной крем, сливочное масло, ваниль.',
      price: 12000,
      image: '/images/napoleon1.PNG',
      isBestSeller: true,
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 12000 },
        { label: '20 см', weight: '2 кг', price: 15000 },
        { label: '24 см', weight: '3 кг', price: 20000 }
      ]
    },
    {
      name: 'Прага',
      category: 'Торты',
      description: 'Насыщенный шоколадный торт с классическим вкусом.',
      composition: 'Шоколадный бисквит, шоколадный крем, какао, глазурь.',
      price: 13000,
      image: '/images/praga1.PNG',
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 13000 },
        { label: '20 см', weight: '2 кг', price: 16000 },
        { label: '24 см', weight: '3 кг', price: 21500 }
      ]
    },
    {
      name: 'Морковный',
      category: 'Торты',
      description: 'Пряный морковный торт с орехами и сливочным кремом.',
      composition: 'Морковный бисквит, орехи, корица, крем-чиз.',
      price: 13000,
      image: '/images/carrot1.PNG',
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 13000 },
        { label: '20 см', weight: '2 кг', price: 16000 },
        { label: '24 см', weight: '3 кг', price: 21500 }
      ]
    },
    {
      name: 'Медовик',
      category: 'Торты',
      description: 'Нежный медовый торт с домашним вкусом.',
      composition: 'Медовые коржи, сметанный крем, мёд, молоко.',
      price: 11500,
      image: '/images/medovik1.PNG',
      isBestSeller: true,
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 11500 },
        { label: '20 см', weight: '2 кг', price: 14500 },
        { label: '24 см', weight: '3 кг', price: 19500 }
      ]
    },
    {
      name: 'Шпинатный',
      category: 'Торты',
      description: 'Яркий зелёный бисквит с лёгким сливочным кремом.',
      composition: 'Шпинатный бисквит, крем-чиз, ягоды, ваниль.',
      price: 13000,
      image: '/images/shpinat1.PNG',
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 13000 },
        { label: '20 см', weight: '2 кг', price: 16000 },
        { label: '24 см', weight: '3 кг', price: 21500 }
      ]
    },
    {
      name: 'Молочная девочка',
      category: 'Торты',
      description: 'Очень нежный торт с тонкими коржами и сливочным кремом.',
      composition: 'Коржи на сгущённом молоке, сливочный крем, ваниль.',
      price: 12500,
      image: '/images/milk1.PNG',
      sizes: [
        { label: '18 см', weight: '1.5 кг', price: 12500 },
        { label: '20 см', weight: '2 кг', price: 15500 },
        { label: '24 см', weight: '3 кг', price: 20500 }
      ]
    },
    {
      name: 'Чизкейк малина',
      category: 'Чизкейки',
      description: 'Нежный чизкейк с малиновой начинкой.',
      composition: 'Сырный крем, песочная основа, малина, сливки.',
      price: 14000,
      image: '/images/cheesecake-rasp1.PNG',
      sizes: [
        { label: '18 см', weight: '1.4 кг', price: 14000 },
        { label: '20 см', weight: '1.8 кг', price: 17000 },
        { label: '24 см', weight: '2.6 кг', price: 23000 }
      ]
    },
    {
      name: 'Чизкейк испанский',
      category: 'Чизкейки',
      description: 'Кремовый баскский чизкейк с карамельной корочкой.',
      composition: 'Сливочный сыр, сливки, яйца, сахар, ваниль.',
      price: 14500,
      image: '/images/spanish-cheesecake1.PNG',
      sizes: [
        { label: '18 см', weight: '1.4 кг', price: 14500 },
        { label: '20 см', weight: '1.8 кг', price: 17500 },
        { label: '24 см', weight: '2.6 кг', price: 23500 }
      ]
    },
    {
      name: 'Бенто под любое оформление',
      category: 'Бенто',
      description: 'Мини-торт с индивидуальным дизайном. Для оформления нужно перейти в WhatsApp и обсудить детали.',
      composition: 'Бисквит, крем-чиз, начинка на выбор, индивидуальный декор.',
      price: 6000,
      image: '/images/bento-custom.JPG',
      isBestSeller: true,
      sizes: [
        { label: '10 см', weight: '450 г', price: 6000 },
        { label: '12 см', weight: '650 г', price: 7500 },
        { label: '14 см', weight: '900 г', price: 9500 }
      ]
    },
    {
      name: 'Круассан Даниш',
      description: 'Нежный слоёный круассан с миндальной начинкой, натуральными сливками и ягодным желе.',
      composition: 'Миндальная начинка, сливки, ягодное желе',
      category: 'Круассаны',
      price: 1200,
      sizes: [
        { label: '1 шт', weight: '100 г', price: 1200 }
      ],
      image: '/images/danish.PNG'
    },
    {
      name: 'Круассан Куб',
      description: 'Круассан с варёной сгущёнкой и натуральными сливками, покрытый белым шоколадом с золотым декором.',
      composition: 'Сгущёнка, сливки, белый шоколад',
      category: 'Круассаны',
      price: 1000,
      sizes: [
        { label: '1 шт', weight: '170 г', price: 1000 }
      ],
      image: '/images/cube.PNG'
    },
    {
      name: 'Круассан Классика',
      description: 'Классический слоёный круассан с выбором начинки.',
      composition: 'Фисташка, малина, нутелла, шоколад, фундук',
      category: 'Круассаны',
      price: 950,
      sizes: [
        { label: 'Фисташка & Малина', weight: '150 г', price: 1000 },
        { label: 'Нутелла', weight: '150 г', price: 950 },
        { label: 'Шоколад & фундук', weight: '150 г', price: 950 }
      ],
      image: '/images/classic.PNG'
    }
  ]);

  const adminHash = await bcrypt.hash('admin12345', 10);

  await User.create({
    name: 'Администратор',
    phone: '+77473924574',
    email: 'admin@tortiki.kz',
    password: adminHash,
    role: 'admin'
  });

  console.log('Seed completed');
  process.exit();
}

seed();