export const SHOP_BRANCHES = [
  { id: 'sci-renaissance', name: 'SCI Renaissance', type: 'Louer', whatsapp: '242000000000' },
  { id: 'sci-espoir', name: 'Fondation SPI', type: 'Louer', whatsapp: '242000000000' },
  { id: 'nouveau-concept', name: 'Nouveau Concept', type: 'Louer', whatsapp: '242000000000' },
  { id: 'atelier-5', name: 'Atelier 5', type: 'Réserver', whatsapp: '242000000000' },
  { id: 'la-manne', name: 'La Manne', type: 'Commander', whatsapp: '242000000000' },
  { id: 'spi-alim', name: 'SPI Alim', type: 'Commander', whatsapp: '242000000000' }
];

export const PRODUCT_TYPES = ['Louer', 'Réserver', 'Commander'];

export const getActionLabel = (type) => {
  switch (type) {
    case 'Louer': return 'Rent';
    case 'Réserver': return 'Book';
    case 'Commander': return 'Order';
    default: return 'Order';
  }
};