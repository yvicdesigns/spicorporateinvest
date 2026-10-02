export const BRANCH_EXPERIENCE_CONFIGS = {
  'sci-renaissance': {
    eyebrow: 'Découvrir SCI Renaissance', title: 'L’immobilier prend vie', intro: 'Explorez notre vision, nos projets et la manière dont nous transformons chaque espace en une adresse porteuse de valeur.',
    expertiseLabel: 'Notre approche', expertiseTitle: 'Concevoir, bâtir et valoriser', expertiseIntro: 'Chaque projet associe lecture du territoire, exigence architecturale et maîtrise opérationnelle.',
    stats: [{ value: 'Sur mesure', label: 'Projets adaptés' }, { value: 'Premium', label: 'Emplacements choisis' }, { value: 'Durable', label: 'Vision à long terme' }, { value: '360°', label: 'Accompagnement global' }]
  },
  'sci-espoir': {
    eyebrow: 'Découvrir Fondation SPI', title: 'Agir avec sens et proximité', intro: 'Découvrez les engagements, les initiatives et les personnes qui donnent vie à la mission de la Fondation SPI.',
    expertiseLabel: 'Notre engagement', expertiseTitle: 'Écouter, accompagner et construire', expertiseIntro: 'Notre action se développe autour des besoins réels, des partenariats utiles et d’un impact durable.',
    stats: [{ value: 'Humain', label: 'Au cœur de l’action' }, { value: 'Proximité', label: 'À l’écoute du terrain' }, { value: 'Impact', label: 'Actions concrètes' }, { value: 'Ensemble', label: 'Partenariats durables' }]
  },
  'nouveau-concept': {
    eyebrow: 'Découvrir Nouveau Concept', title: 'La mobilité en mouvement', intro: 'Entrez dans un univers pensé pour rendre chaque déplacement plus simple, plus fiable et mieux adapté à vos besoins.',
    expertiseLabel: 'Notre mobilité', expertiseTitle: 'Vous déplacer avec maîtrise', expertiseIntro: 'De la réservation à l’arrivée, chaque étape est conçue autour de la ponctualité, du confort et du service.',
    stats: [{ value: 'Fiable', label: 'Service maîtrisé' }, { value: 'Flexible', label: 'Solutions adaptées' }, { value: 'Confort', label: 'Expérience soignée' }, { value: 'Pro', label: 'Particuliers & entreprises' }]
  },
  'atelier-5': {
    eyebrow: 'Découvrir Atelier 5', title: 'Entrez dans notre univers', intro: 'Découvrez l’atmosphère, les gestes et les visages qui donnent vie à Atelier 5. Une immersion au cœur d’une maison de beauté pensée pour révéler chaque personnalité.',
    expertiseLabel: 'Notre savoir-faire', expertiseTitle: 'Une attention précise, à chaque étape', expertiseIntro: 'De la consultation au dernier geste, notre équipe construit une expérience cohérente autour de vos envies, de votre personnalité et de votre quotidien.',
    stats: [{ value: 'Sur mesure', label: 'Conseil personnalisé' }, { value: '360°', label: 'Expérience beauté' }, { value: 'Premium', label: 'Produits sélectionnés' }, { value: 'Brazzaville', label: 'Au cœur de la ville' }]
  },
  'la-manne': {
    eyebrow: 'Découvrir La Manne', title: 'De la terre au produit', intro: 'Découvrez les cultures, les savoir-faire et les femmes et les hommes qui font vivre la production agricole de SPI Alim.',
    expertiseLabel: 'Notre production', expertiseTitle: 'Cultiver avec exigence et responsabilité', expertiseIntro: 'La Manne valorise les ressources locales et construit une production attentive à la qualité et à la traçabilité.',
    stats: [{ value: 'Local', label: 'Productions du territoire' }, { value: 'Frais', label: 'Récoltes sélectionnées' }, { value: 'Suivi', label: 'Traçabilité' }, { value: 'SPI Alim', label: 'Distribution intégrée' }]
  },
  'spi-alim': {
    eyebrow: 'Découvrir SPI Alim', title: 'Une chaîne de valeur maîtrisée', intro: 'De la production La Manne jusqu’à la distribution, découvrez comment SPI Alim rapproche les produits, les professionnels et les consommateurs.',
    expertiseLabel: 'Notre modèle', expertiseTitle: 'Sélectionner, distribuer et servir', expertiseIntro: 'SPI Alim relie production, qualité produit et disponibilité à travers une organisation intégrée.',
    stats: [{ value: 'La Manne', label: 'Production intégrée' }, { value: 'Traçable', label: 'Origine maîtrisée' }, { value: 'Local', label: 'Terroirs valorisés' }, { value: 'B2B & B2C', label: 'Tous les besoins' }]
  },
  'zen-sens': {
    eyebrow: 'Découvrir Zen Sens', title: 'Un voyage au cœur des fragrances', intro: 'Explorez les notes, les matières et les émotions qui composent l’univers olfactif de Zen Sens.',
    expertiseLabel: 'Notre univers olfactif', expertiseTitle: 'Trouver le parfum qui vous ressemble', expertiseIntro: 'Notre sélection et nos conseils vous guident vers une fragrance fidèle à votre personnalité et à vos envies.',
    stats: [{ value: 'Signature', label: 'Sillages de caractère' }, { value: 'Conseil', label: 'Choix personnalisé' }, { value: 'Sélection', label: 'Fragrances choisies' }, { value: 'Cadeaux', label: 'Coffrets parfumés' }]
  },
  'spi-energy': {
    eyebrow: 'Découvrir SPI Energy', title: 'Au cœur de notre expertise pétrolière', intro: 'Découvrez nos activités, nos exigences opérationnelles et notre engagement pour un approvisionnement pétrolier fiable et sécurisé.',
    expertiseLabel: 'Notre métier', expertiseTitle: 'Approvisionner avec fiabilité', expertiseIntro: 'SPI Energy associe logistique, sécurité et qualité de service pour répondre aux besoins pétroliers des professionnels.',
    stats: [{ value: 'Pétrole', label: 'Cœur de métier' }, { value: 'Sécurité', label: 'Exigence opérationnelle' }, { value: 'Logistique', label: 'Chaîne maîtrisée' }, { value: 'B2B', label: 'Solutions professionnelles' }]
  }
};

export const getBranchExperienceConfig = (branchId) => BRANCH_EXPERIENCE_CONFIGS[branchId];
