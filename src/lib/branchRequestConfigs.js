export const BRANCH_REQUEST_CONFIGS = {
  'sci-renaissance': {
    branchName: 'SCI Renaissance', requestType: 'Visite', choiceStep: 'Projet', title: 'Planifiez votre visite', question: 'Quel type de projet vous intéresse ?', schedule: 'datetime', dateLabel: 'Date de visite souhaitée', actionLabel: 'Préparer ma visite',
    categories: [
      { id: 'residence', label: 'Résidentiel', description: 'Appartements et maisons', services: ['Visiter un bien disponible', 'Découvrir un programme neuf', 'Demander une étude personnalisée'] },
      { id: 'commerce', label: 'Commercial', description: 'Bureaux et commerces', services: ['Visiter un local commercial', 'Rechercher des bureaux', 'Étudier une implantation'] },
      { id: 'investissement', label: 'Investissement', description: 'Opportunités et patrimoine', services: ['Recevoir les opportunités', 'Échanger avec un conseiller', 'Étudier un investissement'] }
    ]
  },
  'sci-espoir': {
    branchName: 'Fondation SPI', requestType: 'Rendez-vous', choiceStep: 'Accompagnement', title: 'Préparez votre échange', question: 'Comment pouvons-nous vous accompagner ?', schedule: 'datetime', dateLabel: 'Date de rendez-vous souhaitée', actionLabel: 'Préparer ma demande',
    categories: [
      { id: 'information', label: 'Information', description: 'Découvrir la fondation', services: ['Présentation des actions', 'Demande d’information', 'Rencontrer un responsable'] },
      { id: 'partenariat', label: 'Partenariat', description: 'Construire une collaboration', services: ['Proposer un partenariat', 'Soutenir une initiative', 'Présenter un projet'] },
      { id: 'accompagnement', label: 'Accompagnement', description: 'Exprimer un besoin', services: ['Demander un accompagnement', 'Orienter un bénéficiaire', 'Échanger sur une situation'] }
    ]
  },
  'nouveau-concept': {
    branchName: 'Nouveau Concept', requestType: 'Réservation', choiceStep: 'Mobilité', title: 'Préparez votre demande de mobilité', question: 'Quelle solution recherchez-vous ?', schedule: 'datetime', dateLabel: 'Date souhaitée', actionLabel: 'Préparer ma réservation',
    categories: [
      { id: 'location', label: 'Location', description: 'Une solution adaptée à votre trajet', services: ['Louer un véhicule', 'Location avec chauffeur', 'Location longue durée'] },
      { id: 'transfert', label: 'Transfert', description: 'Aéroport et déplacements', services: ['Transfert aéroport', 'Déplacement professionnel', 'Mise à disposition'] },
      { id: 'entreprise', label: 'Entreprise', description: 'Solutions professionnelles', services: ['Demander un devis flotte', 'Transport d’équipe', 'Solution logistique'] }
    ]
  },
  'atelier-5': {
    branchName: 'Atelier 5', requestType: 'Réservation', choiceStep: 'Prestation', title: 'Préparez votre rendez-vous', question: 'Que souhaitez-vous réserver ?', schedule: 'datetime', dateLabel: 'Date souhaitée', actionLabel: 'Préparer ma réservation',
    categories: [
      { id: 'coiffure', label: 'Coiffure', description: 'Coupe, coiffage et soins capillaires', services: ['Diagnostic et conseil', 'Coupe et coiffage', 'Soin capillaire', 'Coiffure événementielle'] },
      { id: 'massage', label: 'Massage', description: 'Une parenthèse de détente personnalisée', services: ['Massage relaxant', 'Massage tonifiant', 'Massage du dos', 'Massage personnalisé'] },
      { id: 'hammam-sauna', label: 'Hammam & Sauna', description: 'Chaleur, purification et récupération', services: ['Séance hammam', 'Séance sauna', 'Rituel hammam + sauna', 'Parcours détente'] },
      { id: 'beaute', label: 'Beauté & soins', description: 'Des soins adaptés à vos envies', services: ['Soin beauté', 'Mise en beauté', 'Préparation mariage', 'Conseil personnalisé'] },
      { id: 'boutique', label: 'Boutique', description: 'Conseils et disponibilité des produits', services: ['Conseil produit', 'Vérifier un produit', 'Préparer un achat', 'Coffret cadeau'] }
    ]
  },
  'la-manne': {
    branchName: 'La Manne', requestType: 'Commande', choiceStep: 'Produits', title: 'Préparez votre commande', question: 'Quels produits recherchez-vous ?', schedule: 'date', dateLabel: 'Date souhaitée de retrait ou livraison', actionLabel: 'Préparer ma commande',
    categories: [
      { id: 'frais', label: 'Produits frais', description: 'Récoltes et produits de saison', services: ['Fruits et légumes', 'Produits d’élevage', 'Panier de saison'] },
      { id: 'transformes', label: 'Produits transformés', description: 'Le savoir-faire La Manne', services: ['Conserves et préparations', 'Produits artisanaux', 'Coffret découverte'] },
      { id: 'professionnel', label: 'Professionnels', description: 'Besoins en volume', services: ['Demander un catalogue', 'Commande en gros', 'Demander un devis'] }
    ]
  },
  'spi-alim': {
    branchName: 'SPI Alim', requestType: 'Commande', choiceStep: 'Sélection', title: 'Préparez votre commande', question: 'Que souhaitez-vous commander ?', schedule: 'date', dateLabel: 'Date souhaitée', actionLabel: 'Préparer ma commande',
    categories: [
      { id: 'la-manne', label: 'Produits La Manne', description: 'La production agricole de SPI Alim', services: ['Fruits et légumes', 'Panier de saison', 'Produits agricoles La Manne'] },
      { id: 'epicerie', label: 'Épicerie', description: 'Produits sélectionnés', services: ['Composer une sélection', 'Rechercher un produit', 'Demander le catalogue'] },
      { id: 'cadeaux', label: 'Coffrets', description: 'À offrir ou à partager', services: ['Coffret cadeau', 'Panier gourmand', 'Coffret entreprise'] },
      { id: 'professionnel', label: 'Professionnels', description: 'Restauration et événements', services: ['Commande professionnelle', 'Approvisionnement régulier', 'Demander un devis'] }
    ]
  },
  'zen-sens': {
    branchName: 'Zen Sens', requestType: 'Commande', choiceStep: 'Fragrance', title: 'Trouvez votre fragrance', question: 'Quel univers olfactif recherchez-vous ?', schedule: 'date', dateLabel: 'Date souhaitée', actionLabel: 'Préparer ma demande',
    categories: [
      { id: 'femme', label: 'Parfums femme', description: 'Élégance et caractère', services: ['Découvrir les parfums disponibles', 'Recevoir un conseil personnalisé', 'Rechercher une fragrance'] },
      { id: 'homme', label: 'Parfums homme', description: 'Sillages et personnalité', services: ['Découvrir les parfums disponibles', 'Recevoir un conseil personnalisé', 'Rechercher une fragrance'] },
      { id: 'interieur', label: 'Fragrances', description: 'Senteurs et univers olfactifs', services: ['Fragrance d’intérieur', 'Brume parfumée', 'Création olfactive'] },
      { id: 'cadeau', label: 'Coffrets cadeaux', description: 'Une attention parfumée', services: ['Composer un coffret', 'Choisir un cadeau', 'Demander les coffrets disponibles'] }
    ]
  },
  'spi-energy': {
    branchName: 'SPI Energy', requestType: 'Devis', choiceStep: 'Service pétrolier', title: 'Préparez votre demande pétrolière', question: 'Quel est votre besoin ?', schedule: 'date', dateLabel: 'Date souhaitée pour être recontacté', actionLabel: 'Demander un devis',
    categories: [
      { id: 'carburants', label: 'Carburants', description: 'Fourniture et approvisionnement', services: ['Demande d’approvisionnement', 'Fourniture professionnelle', 'Demander une cotation'] },
      { id: 'lubrifiants', label: 'Lubrifiants', description: 'Produits et conseil technique', services: ['Choisir un lubrifiant', 'Commande professionnelle', 'Demander le catalogue'] },
      { id: 'logistique', label: 'Logistique pétrolière', description: 'Stockage et distribution', services: ['Solution de stockage', 'Organisation de livraison', 'Étude logistique'] },
      { id: 'entreprise', label: 'Solutions entreprises', description: 'Besoins sur mesure', services: ['Contrat d’approvisionnement', 'Étude personnalisée', 'Demander un devis professionnel'] }
    ]
  }
};

export const getBranchRequestConfig = (branchId) => BRANCH_REQUEST_CONFIGS[branchId];
